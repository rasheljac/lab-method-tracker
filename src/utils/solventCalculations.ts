
interface GradientStep {
  time: number;
  percent_a: number;
  percent_b: number;
  flow_rate: number;
}

export interface SolventUsage {
  solventA_mL: number;
  solventB_mL: number;
  totalVolume_mL: number;
}

export const calculateSolventUsage = (
  gradientSteps: GradientStep[],
  batchSize: number,
  injectionVolume: number = 0
): SolventUsage => {
  if (!gradientSteps || gradientSteps.length === 0) {
    return { solventA_mL: 0, solventB_mL: 0, totalVolume_mL: 0 };
  }

  // Sort gradient steps by time
  const sortedSteps = [...gradientSteps].sort((a, b) => a.time - b.time);
  
  let totalSolventA = 0;
  let totalSolventB = 0;

  // Calculate solvent usage for each segment between gradient steps
  for (let i = 0; i < sortedSteps.length - 1; i++) {
    const currentStep = sortedSteps[i];
    const nextStep = sortedSteps[i + 1];
    
    const timeDifference = nextStep.time - currentStep.time; // minutes
    const avgFlowRate = (currentStep.flow_rate + nextStep.flow_rate) / 2; // mL/min
    const avgPercentA = (currentStep.percent_a + nextStep.percent_a) / 2; // %
    const avgPercentB = (currentStep.percent_b + nextStep.percent_b) / 2; // %
    
    const segmentVolume = timeDifference * avgFlowRate; // mL
    const segmentSolventA = segmentVolume * (avgPercentA / 100);
    const segmentSolventB = segmentVolume * (avgPercentB / 100);
    
    totalSolventA += segmentSolventA;
    totalSolventB += segmentSolventB;
  }

  // Multiply by batch size to get total usage for all injections
  const solventA_mL = totalSolventA * batchSize;
  const solventB_mL = totalSolventB * batchSize;
  const totalVolume_mL = solventA_mL + solventB_mL;

  // Add injection volume if provided (typically small compared to mobile phase usage)
  const injectionContribution = injectionVolume * batchSize;

  return {
    solventA_mL: Number(solventA_mL.toFixed(2)),
    solventB_mL: Number(solventB_mL.toFixed(2)),
    totalVolume_mL: Number((totalVolume_mL + injectionContribution).toFixed(2))
  };
};
