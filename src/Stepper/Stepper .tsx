import { useState } from "react";


type StepperProps = {
  steps: string[];
  currentStep: number;
};

const StepperUi = ({
  steps,
  currentStep,
}: StepperProps) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "30px",
      }}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
            }}
          >
            {/* Circle */}

            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#fff",
                fontWeight: 600,
                backgroundColor: isCompleted
                  ? "#22c55e"
                  : isActive
                  ? "#2563eb"
                  : "#d1d5db",
              }}
            >
              {isCompleted ? "✓" : index + 1}
            </div>

            {/* Label */}

            <div
              style={{
                marginLeft: "10px",
                marginRight: "10px",
                fontWeight: isActive ? "bold" : 400,
              }}
            >
              {step}
            </div>

            {/* Line */}

            {index !== steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "3px",
                  backgroundColor:
                    index < currentStep
                      ? "#22c55e"
                      : "#d1d5db",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};


export default function Stepper() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Account",
    "Profile",
    "Address",
    "Payment",
    "Review",
  ];

  return (
    <div style={{ padding: "30px" }}>
      <StepperUi
        steps={steps}
        currentStep={currentStep}
      />

      <h2>
        Current Step:
        {" "}
        {steps[currentStep]}
      </h2>

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          disabled={currentStep === 0}
          onClick={() =>
            setCurrentStep((prev) => prev - 1)
          }
        >
          Previous
        </button>

        <button
          disabled={
            currentStep === steps.length - 1
          }
          onClick={() =>
            setCurrentStep((prev) => prev + 1)
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}