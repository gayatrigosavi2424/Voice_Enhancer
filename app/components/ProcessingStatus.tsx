'use client';

interface ProcessingStatusProps {
  step: string;
}

const processingSteps = [
  'Analyzing audio...',
  'Applying noise reduction...',
  'Enhancing voice frequencies...',
  'Removing silence...',
  'Normalizing volume...',
  'Finalizing enhancement...'
];

export default function ProcessingStatus({ step }: ProcessingStatusProps) {
  const currentStepIndex = processingSteps.indexOf(step);
  const progress = currentStepIndex >= 0 ? ((currentStepIndex + 1) / processingSteps.length) * 100 : 0;

  return (
    <div className="card bg-blue-50 border-blue-200">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Processing Audio Enhancement
          </h3>
          
          <div className="space-y-2">
            <p className="text-blue-700 font-medium">{step}</p>
            
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-blue-600">
              <span>Step {currentStepIndex + 1} of {processingSteps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-blue-600 bg-blue-100 p-3 rounded-lg">
        <strong>Processing in your browser:</strong> Your audio is being enhanced locally on your device. 
        No data is sent to external servers, ensuring complete privacy.
      </div>
    </div>
  );
}