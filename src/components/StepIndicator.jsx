import { CheckCircleIcon } from './Icons.jsx'

const StepIndicator = ({ currentStep, totalSteps = 3 }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, index) => (
        <div key={index + 1} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
            index + 1 <= currentStep 
              ? 'bg-oamk-orange-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}>
            {index + 1 < currentStep ? <CheckCircleIcon className="w-5 h-5" /> : index + 1}
          </div>
          {index + 1 < totalSteps && (
            <div className={`w-16 h-1 mx-2 ${
              index + 1 < currentStep ? 'bg-oamk-orange-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default StepIndicator 