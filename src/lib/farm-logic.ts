import type { FarmProfile } from './farm-storage';

export function getCropAge(sowingDate: string): number {
  const sown = new Date(sowingDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - sown.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function getCropStage(crop: string, ageDays: number): string {
  const stages: Record<string, { day: number; task: string; taskGu: string }[]> = {
    cotton: [
      { day: 0, task: 'Sowing', taskGu: 'વાવેતર' },
      { day: 20, task: 'First irrigation', taskGu: 'પ્રથમ પિયત' },
      { day: 30, task: 'Urea 50kg/acre', taskGu: 'યુરિયા ૫૦ કિલો/એકર' },
      { day: 60, task: 'Pest check', taskGu: 'જીવાત તપાસ' },
      { day: 90, task: 'Second urea', taskGu: 'બીજું યુરિયા' },
      { day: 150, task: 'Harvest prep', taskGu: 'લણણી તૈયારી' },
    ],
    groundnut: [
      { day: 0, task: 'Sowing', taskGu: 'વાવેતર' },
      { day: 25, task: 'Gypsum 100kg/acre', taskGu: 'જીપ્સમ ૧૦૦ કિલો' },
      { day: 45, task: 'Weeding', taskGu: 'નીંદણ' },
      { day: 90, task: 'Harvest prep', taskGu: 'લણણી તૈયારી' },
    ],
    wheat: [
      { day: 0, task: 'Sowing', taskGu: 'વાવેતર' },
      { day: 25, task: 'First irrigation', taskGu: 'પ્રથમ પિયત' },
      { day: 45, task: 'Urea 40kg/acre', taskGu: 'યુરિયા ૪૦ કિલો' },
      { day: 80, task: 'Second urea', taskGu: 'બીજું યુરિયા' },
    ],
    bajra: [
      { day: 0, task: 'Sowing', taskGu: 'વાવેતર' },
      { day: 25, task: 'Urea 30kg/acre', taskGu: 'યુરિયા ૩૦ કિલો' },
      { day: 60, task: 'Harvest prep', taskGu: 'લણણી તૈયારી' },
    ],
    cumin: [
      { day: 0, task: 'Sowing', taskGu: 'વાવેતર' },
      { day: 30, task: 'First irrigation', taskGu: 'પ્રથમ પિયત' },
      { day: 60, task: 'Pest check', taskGu: 'જીવાત તપાસ' },
    ],
  };

  const cropStages = stages[crop] || [];
  let current = cropStages[0];

  for (const stage of cropStages) {
    if (ageDays >= stage.day) current = stage;
    else break;
  }

  const next = cropStages.find((s) => s.day > ageDays);

  return next
    ? `Aaj: ${current.task} · Next: ${next.task} (Day ${next.day})`
    : current?.task || 'Crop growing well';
}

export function getIrrigationAdvice(
  rainTomorrow: number,
  cropAge: number,
): { advice: string; emoji: string } {
  if (rainTomorrow > 5) {
    return { advice: 'Kal barish — irrigation skip karo', emoji: '🌧️' };
  }
  if (cropAge > 0 && cropAge % 7 === 0) {
    return { advice: 'Aaj irrigation ka din', emoji: '💧' };
  }
  return { advice: 'Irrigation kal', emoji: '⏰' };
}

export function getEstimatedProfit(
  crop: string,
  acres: number,
  mandiPrice: number,
): number {
  const yields: Record<string, number> = {
    cotton: 8,
    groundnut: 10,
    wheat: 20,
    bajra: 12,
    cumin: 3,
  };
  const yieldPerAcre = yields[crop] || 8;
  const totalQuintal = yieldPerAcre * acres;
  return totalQuintal * mandiPrice;
}
