import React, { useEffect, useState } from 'react';

function Toast() {
    // State to control the visibility of the toast
    const [isHidden, setIsHidden] = useState(false);

    // Hide the toast after a delay
    useEffect(() => {
        const hideToast = setTimeout(() => {
            setIsHidden(true);
        }, 7000);

        // Clean up the timeout when the component unmounts or when the toast is hidden
        return () => clearTimeout(hideToast);
    }, []);

    // Render the toast only if it's not hidden
    return !isHidden ? (
        <div id='toast' className='bg-blue-600 text-white px-4 text-center rounded-md shadow animate-bounce'>
            <p>
                You can press <span className='font-medium'>'R'</span> to reset the canvas.
            </p>
        </div>
    ) : null;
}

export default Toast;
