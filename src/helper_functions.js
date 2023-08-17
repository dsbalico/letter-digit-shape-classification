import * as tf from '@tensorflow/tfjs';

// Mapping functions for digits and letters
export const digitMapping = (inputValue) => inputValue + 48;
export const letterMapping = (inputValue) => inputValue + 65;

// Merged mapping function
export const mergedMapping = (inputValue) => {
    const asciiCodes = [
        // List of ASCII codes for digits and letters
        48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
        65, 66, 67, 68, 69, 70, 71, 72, 73, 74,
        75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
        85, 86, 87, 88, 89, 90, 97, 98, 100, 101,
        102, 103, 104, 110, 113, 114, 116
    ];
    return asciiCodes[inputValue];
};

export const shapeMapping = (inputValue) => {
    const mapping = {
        '0': 'Circle',
        '1': 'Diamond',
        '2': 'Heart',
        '3': 'Moon',
        '4': 'Oval',
        '5': 'Parallelogram',
        '6': 'Rectangle',
        '7': 'Square',
        '8': 'Star',
        '9': 'Trapezoid',
        '10': 'Triangle'
    };

    return mapping[inputValue];
};

// Preprocess an image for model input
export const preprocessImage = (image, rotate) => {
    const targetSize = [28, 28];

    // Resize the image
    const resizedImage = tf.image.resizeBilinear(image, targetSize);

    // Invert the colors and normalize
    const invertedImage = resizedImage.mul(tf.scalar(-1)).add(tf.scalar(255)).div(tf.scalar(255));

    let transformedImage = invertedImage;

    if (rotate) {
        // Rotate the image by transposing
        transformedImage = invertedImage.transpose([1, 0, 2]);
    }

    // Reshape the image for model input
    const normalizedImage = transformedImage.reshape([1, ...targetSize, 1]);

    return normalizedImage;
};

