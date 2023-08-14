import React, { useEffect, useState } from 'react';
import Canvas from './Canvas';
import { useNavigate } from 'react-router-dom';

function Classifier({
    classify = true,
    filename,
    setFilename,
    title,
    accuracy,
    description,
    result = null,
    isLoading,
    canvasRef,
    submitFunction,
    dev = false,
}) {
    const [currentAccuracy, setCurrentAccuracy] = useState(0);
    const [brushSize, setBrushSize] = useState(8);
    const navigate = useNavigate();

    useEffect(() => {
        // Update the current accuracy gradually if an accuracy goal is specified
        if (accuracy > 0) {
            const incrementSpeed = 6.66; // Adjust the increment speed as needed
            const interval = setInterval(() => {
                setCurrentAccuracy((prevAccuracy) =>
                    prevAccuracy + incrementSpeed >= accuracy ? accuracy : prevAccuracy + incrementSpeed
                );
            }, 50);

            // Clean up the interval when the component unmounts or when accuracy changes
            return () => clearInterval(interval);
        }
    }, [accuracy]);

    return (
        <div className={`flex gap-4 relative ${dev ? 'bg-stripes' : ''}`}>
            {/* Show under-development notice and button if dev mode is enabled */}
            {dev && (
                <div className='absolute bg-gray-200 z-10 top-14 shadow-lg w-full text-center py-4'>
                    <p className='text-3xl font-bold text-gray-700'>Under Development</p>
                    <button onClick={() => navigate('/create-dataset')} className='text-blue-700 hover:text-blue-600 underline'>
                        Create Dataset
                    </button>
                </div>
            )}

            {/* Canvas component for drawing */}
            <div className='self-center'>
                <Canvas canvasRef={canvasRef} brushSize={brushSize}></Canvas>
            </div>

            {/* Classifier details section */}
            <div className='w-full'>
                <h3 className='text-2xl font-bold tracking-wide'>
                    {title} {accuracy && <span className='text-xs text-green-600'>{currentAccuracy.toFixed(2)}%</span>}
                </h3>
                <p className='text-xs sm:text-sm text-gray-600'>{description}</p>
                
                {/* Brush Size Slider */}
                <p className='text-xs mt-1 text-gray-600'>Brush Size</p>
                <input
                    type='range'
                    min='2'
                    max='20'
                    value={brushSize}
                    onChange={(e) => setBrushSize(e.target.value)}
                    className='w-full' />


                {/* Display result or input filename based on result presence */}
                {result !== null ? (
                    <>
                        <p className='text-xs mt-1 text-gray-600'>Result:</p>
                        <p className='border border-dashed bg-gray-50 mt-0.5 rounded-md py-1 text-center text-xl font-bold'>{result}</p>
                    </>
                ) : (
                    <>
                        <p className='text-xs mt-1 text-gray-600'>Filename:</p>
                        <input
                            type='text'
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className='mt-2 border border-dashed rounded-md px-2 w-full py-0.5 bg-gray-50'
                            placeholder='Filename'
                        />
                    </>
                )}

                {/* Classify/Download button */}
                <button
                    disabled={dev}
                    onClick={() => submitFunction(title.toLowerCase())}
                    className={`w-full bg-blue-700 hover:bg-blue-500 ${dev ? 'cursor-not-allowed' : ''} transition-all rounded-md mt-4 py-2 text-white`}
                >
                    {!classify ? 'Download' : 'Classify'}
                </button>

                {/* Loading animation */}
                <div className={`grid-cols-3 grid mt-1`}>
                    <div className={`h-1 bg-blue-600 rounded-l-full ${isLoading ? 'animate-loading' : ''}`}></div>
                    <div className={`h-1 bg-yellow-400 ${isLoading ? 'animate-loading' : ''}`}></div>
                    <div className={`h-1 bg-red-600 rounded-r-full ${isLoading ? 'animate-loading' : ''}`}></div>
                </div>
            </div>
        </div>
    );
}

export default Classifier;
