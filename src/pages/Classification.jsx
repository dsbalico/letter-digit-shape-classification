import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { PiGithubLogoFill } from 'react-icons/pi';
import { GrTest } from 'react-icons/gr';
import { BiSolidErrorCircle } from 'react-icons/bi';
import CanvasInteraction from '../components/CanvasInteraction';
import { SiGooglecolab } from 'react-icons/si';
import { digitMapping, letterMapping, mergedMapping, preprocessImage } from './../helper_functions';
import Toast from './../components/Toast';

function Classification() {
    // State for holding prediction results and models
    const [results, setResults] = useState({
        letter: '',
        digit: '',
        shape: '',
        merged: '',
    });
    const [letterModel, setLetterModel] = useState(null);
    const [digitModel, setDigitModel] = useState(null);
    // const [shapeModel, setShapeModel] = useState(null);
    const [mergedModel, setMergedModel] = useState(null);

    // State for loading indicators and errors
    const [isLoading, setIsLoading] = useState({
        letter: false,
        digit: false,
        shape: false,
        merged: false,
    });
    const [error, setError] = useState(null);
    const [mergeScreen, setMergeScreen] = useState(false);

    // Refs for canvas elements
    const refs = {
        letter: useRef(null),
        digit: useRef(null),
        shape: useRef(null),
        merged: useRef(null),
    };

    // Load models from paths on component mount
    useEffect(() => {
        const loadModel = async (modelPath, modelSetter) => {
            try {
                const loadedModel = await tf.loadLayersModel(modelPath);
                modelSetter(loadedModel);
            } catch (error) {
                setError(`Error loading model from path ${modelPath}`);
            }
        };

        loadModel("letter/model.json", setLetterModel);
        loadModel("digit/model.json", setDigitModel);
        // loadModel("shape/model.json", setShapeModel);
        loadModel("merged/model.json", setMergedModel);
    }, []);

    // Function for predicting drawings
    const predictDrawing = async (category) => {
        setIsLoading({ ...isLoading, [category]: true });

        const categoryMappings = {
            // Mapping of category to canvas, model, and result updater functions
            'letter': {
                canvas: refs.letter.current,
                model: letterModel,
                mappingFunction: (predictedClass) => String.fromCharCode(letterMapping(predictedClass - 1)),
                resultStateUpdater: (letter) => setResults({ ...results, letter })
            },
            'digit': {
                canvas: refs.digit.current,
                model: digitModel,
                mappingFunction: (predictedClass) => String.fromCharCode(digitMapping(predictedClass)),
                resultStateUpdater: (digit) => setResults({ ...results, digit })
            },
            'merged': {
                canvas: refs.merged.current,
                model: mergedModel,
                mappingFunction: (predictedClass) => String.fromCharCode(mergedMapping(predictedClass)),
                resultStateUpdater: (merged) => setResults({ ...results, merged })
            }
        };

        // Delay the prediction to avoid overwhelming the UI.
        setTimeout(async () => {
            const categoryMapping = categoryMappings[category];
            const { canvas, model, mappingFunction, resultStateUpdater } = categoryMapping;

            const context = canvas.getContext('2d', { willReadFrequently: true });
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const inputTensor = tf.browser.fromPixels(imageData, 1);
            const preprocessedTensor = preprocessImage(inputTensor);

            const predictions = await model.predict(preprocessedTensor);
            const predictedClass = predictions.argMax(1).dataSync()[0];

            const result = mappingFunction(predictedClass);
            resultStateUpdater(result);

            inputTensor.dispose();
            preprocessedTensor.dispose();

            setIsLoading({ ...isLoading, [category]: false });
        }, 500);
    };

    return (
        <div className='bg-gray-100 bg-stripes'>
            {/* Main content */}
            <div className={`flex flex-wrap md:w-[500px] md:mx-auto h-screen justify-center ${mergeScreen ? 'lg:w-[500px]' : 'lg:w-[1400px]'}`}>
                <h1 className='absolute top-4 text-gray-600 tracking-widest flex gap-1'>
                    <GrTest className='self-center' />
                    <span className='self-center'>Model Testing</span>
                    <button onClick={() => setMergeScreen(!mergeScreen)} className='bg-gray-300 px-2 rounded-md shadow-sm py-0.5'>{mergeScreen ? 'Separated Models' : 'Switch to Merged Model'}</button>
                </h1>

                {/* Toast notification */}
                <div className='hidden lg:block lg:fixed top-16'>
                    <Toast />
                </div>

                {/* Canvas Interaction components */}
                <div className='self-center mt-16 bg-white w-full py-6 px-4 lg:px-6 rounded-md mx-2 shadow-md '>
                    {!mergeScreen ? (
                        // Separate models view
                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                            <CanvasInteraction
                                key={1}
                                title={"Letter"}
                                accuracy={93.91}
                                description={"Any letter from Aa to Zz"}
                                result={results.letter}
                                isLoading={isLoading.letter}
                                canvasRef={refs.letter}
                                submitFunction={predictDrawing}
                            />
                            <CanvasInteraction
                                key={2}
                                title={"Digit"}
                                accuracy={99.70}
                                description={"Any digit from 0 to 9"}
                                result={results.digit}
                                isLoading={isLoading.digit}
                                canvasRef={refs.digit}
                                submitFunction={predictDrawing}
                            />
                            <CanvasInteraction
                                key={3}
                                title={"Shape"}
                                description={"See list of employed shapes"}
                                result={results.shape}
                                isLoading={isLoading.shape}
                                canvasRef={refs.shape}
                                submitFunction={predictDrawing}
                                dev={true}
                            />
                        </div>
                    ) : (
                        // Merged model view
                        <div className=''>
                            <CanvasInteraction
                                key={4}
                                title={"Merged"}
                                accuracy={91.36}
                                description={"Letter and digit merged."}
                                result={results.merged}
                                isLoading={isLoading.merged}
                                canvasRef={refs.merged}
                                submitFunction={predictDrawing}
                            />
                        </div>
                    )}

                    <hr className='mt-4' />

                    {/* Error notification */}
                    {error ? (
                        <p className='mt-2 bg-stripes-red py-1 text-center rounded-md px-2 text-red-800 font-medium tracking-wide flex gap-1'>
                            <BiSolidErrorCircle className='self-center text-lg' />
                            {error}
                        </p>
                    ) : null}
                </div>
            </div>

            {/* GitHub and Colab links */}
            <p className='mt-4 flex gap-1.5 justify-center text-gray-600 text-center rounded-md pb-4 hover:text-gray-500'>
                <a href='https://github.com/dsbalico/digit-letter-shape-classification' target='_blank' className='flex gap-1 hover:text-blue-600 transition-all'>
                    <PiGithubLogoFill className='self-center' />
                    Check code on GitHub
                </a>
                |
                <a href="https://colab.research.google.com/drive/1q8_sVYKTOzDFhNMlA_LYQm4-pMvBXanc?usp=sharing" target='_blank' className='flex gap-1 hover:text-blue-600 transition-all'>
                    <SiGooglecolab className='text-orange-500 self-center' />
                    Check notebook
                </a>
            </p>
        </div>
    );
}

export default Classification;
