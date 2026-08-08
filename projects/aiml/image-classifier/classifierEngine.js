/**
 * @fileoverview Pure logic for the AI Image Classifier.
 * @description Contains testable classification and custom-model utilities.
 */

/**
 * Formats KNN confidence results into prediction objects.
 *
 * @param {Object} confidences - Map of class IDs to confidence values.
 * @param {Array} customClasses - Custom class definitions.
 * @returns {Array<{className: string, probability: number}>}
 */
function formatCustomPredictions(confidences, customClasses) {
  return Object.entries(confidences)
    .map(([classId, probability]) => {
      const classObj = customClasses.find(c => c.id === classId);

      return {
        className: classObj ? classObj.name : "Unknown",
        probability,
      };
    })
    .sort((a, b) => b.probability - a.probability);
}

/**
 * Checks whether custom prediction can be performed.
 *
 * Prediction requires:
 * - At least two classes containing training images.
 * - A test image.
 *
 * @param {Array} customClasses - Custom class definitions.
 * @param {Object|null} testImage - Uploaded test image.
 * @returns {boolean}
 */
function canPredictCustom(customClasses, testImage) {
  const validClassesCount = customClasses.filter(
    classObj => classObj.count > 0
  ).length;

  return validClassesCount >= 2 && !!testImage;
}

/**
 * Checks whether a prediction has low confidence.
 *
 * @param {Array} predictions - Prediction objects.
 * @param {number} threshold - Confidence threshold.
 * @returns {boolean}
 */
function hasLowConfidence(predictions, threshold = 0.1) {
  if (!predictions || predictions.length === 0) {
    return false;
  }

  return predictions[0].probability < threshold;
}

/**
 * Validates a new custom class name.
 *
 * @param {string} className - Class name entered by the user.
 * @param {Array} customClasses - Existing custom classes.
 * @returns {{valid: boolean, error: string|null}}
 */
function validateClassName(className, customClasses) {
  const name = className.trim();

  if (!name) {
    return {
      valid: false,
      error: "Class name cannot be empty.",
    };
  }

  if (customClasses.some(c => c.name === name)) {
    return {
      valid: false,
      error: "Class name already exists.",
    };
  }

  return {
    valid: true,
    error: null,
  };
}

/**
 * Counts custom classes that contain training images.
 *
 * @param {Array} customClasses - Custom class definitions.
 * @returns {number}
 */
function countTrainedClasses(customClasses) {
  return customClasses.filter(classObj => classObj.count > 0).length;
}

/**
 * Removes classes with zero training images.
 *
 * @param {Array} customClasses - Custom class definitions.
 * @returns {Array}
 */
function getTrainedClasses(customClasses) {
  return customClasses.filter(classObj => classObj.count > 0);
}

/**
 * Converts prediction probabilities to percentage values.
 *
 * @param {number} probability - Probability between 0 and 1.
 * @returns {string}
 */
function formatConfidence(probability) {
  return (probability * 100).toFixed(2);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    formatCustomPredictions,
    canPredictCustom,
    hasLowConfidence,
    validateClassName,
    countTrainedClasses,
    getTrainedClasses,
    formatConfidence,
  };
}