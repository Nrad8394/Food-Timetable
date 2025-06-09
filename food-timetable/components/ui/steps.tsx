import { CheckCircle2 } from "lucide-react"

interface Step {
  title: string
  description?: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="space-y-4">
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                index < currentStep
                  ? "border-primary bg-primary text-primary-foreground"
                  : index === currentStep
                    ? "border-primary text-primary"
                    : "border-muted-foreground text-muted-foreground"
              }`}
            >
              {index < currentStep ? <CheckCircle2 className="h-5 w-5" /> : <span>{index + 1}</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between px-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`text-center ${index <= currentStep ? "text-foreground" : "text-muted-foreground"}`}
            style={{ width: `${100 / steps.length}%` }}
          >
            <p className="text-sm font-medium">{step.title}</p>
            {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
