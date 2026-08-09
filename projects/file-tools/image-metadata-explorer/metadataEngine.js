// --- BASIC IMAGE METADATA ENGINE ---

const TAGS = {
  0x010f: "make",
  0x0110: "model",
  0x0112: "orientation",
  0x0131: "software",
  0x0132: "dateTime",
  0x8769: "exifOffset",
  0x8825: "gpsOffset",
  0x9003: "dateTaken",
  0x920a: "focalLength",
  0x829a: "exposureTime",
  0x829d: "fNumber",
  0x8827: "iso",
  0xa434: "lensModel",
};

const GPS_TAGS = {
  0x0001: "latitudeRef",
  0x0002: "latitude",
  0x0003: "longitudeRef",
  0x0004: "longitude",
  0x0005: "altitudeRef",
  0x0006: "altitude",
};

const TYPE_SIZES = {
  1: 1,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  7: 1,
  9: 4,
  10: 8,
};

function isValidString(value) {
  if (typeof value !== "string") {
    return false;
  }

  const cleaned = value.replace(/[\x00-\x1f\x7f]/g, "").trim();

  return cleaned.length > 0;
}

function cleanString(value) {
  if (!isValidString(value)) {
    return null;
  }

  return value
    .replace(/[\x00-\x1f\x7f]/g, "")
    .trim();
}

function readString(view, offset, length) {
  if (
    offset < 0 ||
    length <= 0 ||
    offset + length > view.byteLength
  ) {
    return null;
  }

  let value = "";

  for (let i = 0; i < length; i++) {
    const char = view.getUint8(offset + i);

    if (char === 0) {
      break;
    }

    // Ignore invalid control characters.
    if (char >= 32 && char <= 126) {
      value += String.fromCharCode(char);
    }
  }

  return cleanString(value);
}

function readValue(view, type, count, valueFieldOffset, littleEndian) {
  const size = TYPE_SIZES[type];

  if (!size || !Number.isFinite(count) || count <= 0) {
    return null;
  }

  const totalSize = size * count;

  let valueOffset;

  if (totalSize <= 4) {
    valueOffset = valueFieldOffset;
  } else {
    if (valueFieldOffset + 4 > view.byteLength) {
      return null;
    }

    valueOffset = view.getUint32(
      valueFieldOffset,
      littleEndian
    );
  }

  if (
    valueOffset < 0 ||
    valueOffset + totalSize > view.byteLength
  ) {
    return null;
  }

  switch (type) {
    case 2:
      return readString(view, valueOffset, count);

    case 3: {
      const values = [];

      for (let i = 0; i < count; i++) {
        values.push(
          view.getUint16(
            valueOffset + i * 2,
            littleEndian
          )
        );
      }

      return count === 1 ? values[0] : values;
    }

    case 4: {
      const values = [];

      for (let i = 0; i < count; i++) {
        values.push(
          view.getUint32(
            valueOffset + i * 4,
            littleEndian
          )
        );
      }

      return count === 1 ? values[0] : values;
    }

    case 5: {
      const values = [];

      for (let i = 0; i < count; i++) {
        const numerator = view.getUint32(
          valueOffset + i * 8,
          littleEndian
        );

        const denominator = view.getUint32(
          valueOffset + i * 8 + 4,
          littleEndian
        );

        if (denominator === 0) {
          values.push(null);
        } else {
          values.push(numerator / denominator);
        }
      }

      return count === 1 ? values[0] : values;
    }

    case 1:
    case 7: {
      const values = [];

      for (let i = 0; i < count; i++) {
        values.push(
          view.getUint8(valueOffset + i)
        );
      }

      return count === 1 ? values[0] : values;
    }

    case 9: {
      const values = [];

      for (let i = 0; i < count; i++) {
        values.push(
          view.getInt32(
            valueOffset + i * 4,
            littleEndian
          )
        );
      }

      return count === 1 ? values[0] : values;
    }

    case 10: {
      const values = [];

      for (let i = 0; i < count; i++) {
        const numerator = view.getInt32(
          valueOffset + i * 8,
          littleEndian
        );

        const denominator = view.getInt32(
          valueOffset + i * 8 + 4,
          littleEndian
        );

        values.push(
          denominator === 0
            ? null
            : numerator / denominator
        );
      }

      return count === 1 ? values[0] : values;
    }

    default:
      return null;
  }
}

function readIFD(view, offset, littleEndian, tagMap) {
  const metadata = {};

  if (
    offset < 0 ||
    offset + 2 > view.byteLength
  ) {
    return metadata;
  }

  const entryCount = view.getUint16(
    offset,
    littleEndian
  );

  const entriesStart = offset + 2;

  for (let i = 0; i < entryCount; i++) {
    const entryOffset = entriesStart + i * 12;

    if (entryOffset + 12 > view.byteLength) {
      break;
    }

    const tag = view.getUint16(
      entryOffset,
      littleEndian
    );

    const type = view.getUint16(
      entryOffset + 2,
      littleEndian
    );

    const count = view.getUint32(
      entryOffset + 4,
      littleEndian
    );

    const name = tagMap[tag];

    if (!name) {
      continue;
    }

    const value = readValue(
      view,
      type,
      count,
      entryOffset + 8,
      littleEndian
    );

    if (value !== null) {
      metadata[name] = value;
    }
  }

  return metadata;
}

function findExifSegment(view) {
  if (view.byteLength < 4) {
    return -1;
  }

  // JPEG signature.
  if (
    view.getUint8(0) !== 0xff ||
    view.getUint8(1) !== 0xd8
  ) {
    return -1;
  }

  let offset = 2;

  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) {
      offset++;
      continue;
    }

    const marker = view.getUint8(offset + 1);

    if (marker === 0xda) {
      break;
    }

    if (
      marker === 0xd8 ||
      marker === 0xd9
    ) {
      offset += 2;
      continue;
    }

    const segmentLength = view.getUint16(
      offset + 2,
      false
    );

    if (segmentLength < 2) {
      break;
    }

    if (marker === 0xe1) {
      const exifStart = offset + 4;

      if (
        exifStart + 6 <= view.byteLength &&
        view.getUint8(exifStart) === 0x45 &&
        view.getUint8(exifStart + 1) === 0x78 &&
        view.getUint8(exifStart + 2) === 0x69 &&
        view.getUint8(exifStart + 3) === 0x66 &&
        view.getUint8(exifStart + 4) === 0x00 &&
        view.getUint8(exifStart + 5) === 0x00
      ) {
        return exifStart + 6;
      }
    }

    offset += 2 + segmentLength;
  }

  return -1;
}

function parseTIFF(view, tiffStart) {
  if (tiffStart + 8 > view.byteLength) {
    return {};
  }

  const byteOrder =
    String.fromCharCode(
      view.getUint8(tiffStart),
      view.getUint8(tiffStart + 1)
    );

  let littleEndian;

  if (byteOrder === "II") {
    littleEndian = true;
  } else if (byteOrder === "MM") {
    littleEndian = false;
  } else {
    return {};
  }

  const magic = view.getUint16(
    tiffStart + 2,
    littleEndian
  );

  if (magic !== 42) {
    return {};
  }

  const firstIFDOffset = view.getUint32(
    tiffStart + 4,
    littleEndian
  );

  const ifdOffset =
    tiffStart + firstIFDOffset;

  if (
    ifdOffset < tiffStart ||
    ifdOffset >= view.byteLength
  ) {
    return {};
  }

  const metadata = readIFD(
    view,
    ifdOffset,
    littleEndian,
    TAGS
  );

  if (metadata.exifOffset) {
    const exifMetadata = readIFD(
      view,
      tiffStart + metadata.exifOffset,
      littleEndian,
      TAGS
    );

    Object.assign(metadata, exifMetadata);
  }

  if (metadata.gpsOffset) {
    const gpsMetadata = readIFD(
      view,
      tiffStart + metadata.gpsOffset,
      littleEndian,
      GPS_TAGS
    );

    Object.assign(metadata, gpsMetadata);
  }

  return metadata;
}

function dmsToDecimal(values, reference) {
  if (!Array.isArray(values) || values.length < 3) {
    return null;
  }

  const degrees = Number(values[0]);
  const minutes = Number(values[1]);
  const seconds = Number(values[2]);

  if (
    !Number.isFinite(degrees) ||
    !Number.isFinite(minutes) ||
    !Number.isFinite(seconds)
  ) {
    return null;
  }

  if (
    minutes < 0 ||
    minutes >= 60 ||
    seconds < 0 ||
    seconds >= 60
  ) {
    return null;
  }

  let decimal =
    degrees +
    minutes / 60 +
    seconds / 3600;

  const direction =
    String(reference || "").toUpperCase();

  if (direction === "S" || direction === "W") {
    decimal *= -1;
  }

  return Number(decimal.toFixed(6));
}

function normalizeMetadata(raw) {
  const metadata = {};

  if (!raw || typeof raw !== "object") {
    return metadata;
  }

  const make = cleanString(raw.make);
  const model = cleanString(raw.model);
  const lensModel = cleanString(raw.lensModel);
  const software = cleanString(raw.software);

  if (make) metadata.make = make;
  if (model) metadata.model = model;
  if (lensModel) metadata.lensModel = lensModel;
  if (software) metadata.software = software;

  // Exposure time
  if (Number.isFinite(Number(raw.exposureTime))) {
    const value = Number(raw.exposureTime);

    if (value > 0) {
      metadata.exposureTime =
        value >= 1
          ? `${Number(value.toFixed(3))} s`
          : `1/${Math.round(1 / value)} s`;
    }
  }

  // F-number
  if (Number.isFinite(Number(raw.fNumber))) {
    const value = Number(raw.fNumber);

    if (value > 0) {
      metadata.fNumber =
        `f/${Number(value.toFixed(1))}`;
    }
  }

  // ISO
  if (Number.isFinite(Number(raw.iso))) {
    const value = Number(raw.iso);

    if (value > 0 && value <= 100000) {
      metadata.iso = value;
    }
  }

  // Focal length
  if (Number.isFinite(Number(raw.focalLength))) {
    const value = Number(raw.focalLength);

    // Ignore clearly invalid values.
    if (value > 0 && value <= 1000) {
      metadata.focalLength =
        `${Number(value.toFixed(1))} mm`;
    }
  }

  // GPS
  if (raw.latitude && raw.latitudeRef) {
    const latitude = dmsToDecimal(
      raw.latitude,
      raw.latitudeRef
    );

    if (latitude !== null) {
      metadata.latitude = latitude;
    }
  }

  if (raw.longitude && raw.longitudeRef) {
    const longitude = dmsToDecimal(
      raw.longitude,
      raw.longitudeRef
    );

    if (longitude !== null) {
      metadata.longitude = longitude;
    }
  }

  // Altitude
  if (Number.isFinite(Number(raw.altitude))) {
    let altitude = Number(raw.altitude);

    if (Number(raw.altitudeRef) === 1) {
      altitude *= -1;
    }

    metadata.altitude =
      `${Number(altitude.toFixed(1))} m`;
  }

  // Date
  const dateTaken =
    cleanString(raw.dateTaken) ||
    cleanString(raw.dateTime);

  if (dateTaken) {
    metadata.dateTaken = dateTaken;
  }

  // Orientation
  const orientationNames = {
    1: "Normal",
    2: "Mirrored horizontally",
    3: "Rotated 180°",
    4: "Mirrored vertically",
    5: "Mirrored horizontally and rotated 270°",
    6: "Rotated 90° clockwise",
    7: "Mirrored horizontally and rotated 90°",
    8: "Rotated 270° clockwise",
  };

  if (raw.orientation !== undefined) {
    const orientation =
      orientationNames[raw.orientation];

    if (orientation) {
      metadata.orientation = orientation;
    }
  }

  return metadata;
}

async function parse(file) {
  if (!file) {
    throw new Error("No image file provided.");
  }

  if (typeof file.arrayBuffer !== "function") {
    throw new Error("Invalid image file.");
  }

  const buffer = await file.arrayBuffer();

  if (!buffer || buffer.byteLength === 0) {
    throw new Error("The image file is empty.");
  }

  const view = new DataView(buffer);

  const tiffStart = findExifSegment(view);

  if (tiffStart === -1) {
    return {};
  }

  const rawMetadata = parseTIFF(
    view,
    tiffStart
  );

  return normalizeMetadata(rawMetadata);
}

module.exports = {
  formatFileSize,
  gpsToDecimal,
  getMetadataGroups,
  metadataToJSON,
};