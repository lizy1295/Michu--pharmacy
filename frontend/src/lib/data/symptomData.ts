export interface SymptomItem {
  name: string;
  description: string;
  severity?: 'mild' | 'moderate' | 'severe' | 'common' | 'occasional';
  category?: string;
}

export interface DoctorVisitTrigger {
  urgency: 'routine' | 'prompt' | 'emergency';
  title: string;
  description: string;
}

export interface SourceCitation {
  organization: string;
  title: string;
  year?: string;
  url?: string;
  notes?: string;
}

export interface ChronicCondition {
  id: string;
  name: string;
  shortName: string;
  category: 'Endocrine & Metabolic' | 'Cardiovascular' | 'Respiratory' | 'Musculoskeletal' | 'Gastrointestinal' | 'Neurological';
  categoryIcon: string;
  aliases: string[];
  searchKeywords: string[];
  summary: string;
  overview: string;
  pathophysiology: string;
  commonSymptoms: SymptomItem[];
  whenToSeeDoctor: DoctorVisitTrigger[];
  emergencyTriggers: string[];
  lifestyleAndSelfCare: string[];
  pharmacistGuidance: string[];
  commonMedicationClasses: { name: string; purpose: string; example: string }[];
  sourceCitations: SourceCitation[];
}

export interface RedFlagAlert {
  keyword: string;
  matchedCategory: string;
  title: string;
  dangerLevel: 'CRITICAL_EMERGENCY' | 'URGENT_EVALUATION';
  immediateActions: string[];
  emergencyPhone: string;
  secondaryPhone?: string;
  description: string;
}

export const RED_FLAG_KEYWORDS: RedFlagAlert[] = [
  {
    keyword: 'chest pain',
    matchedCategory: 'Cardiovascular Emergency',
    title: 'Severe / Acute Chest Pain Detected',
    dangerLevel: 'CRITICAL_EMERGENCY',
    immediateActions: [
      'Stop all physical activity and sit down in a comfortable, semi-upright position.',
      'Call local emergency services immediately (907 / 911 in Ethiopia) or go to the nearest emergency hospital.',
      'If prescribed nitroglycerin and not allergic, take it as directed by your physician.',
      'Chew 300mg non-enteric coated aspirin if advised by emergency dispatchers and no bleeding contraindications.',
      'Do NOT attempt to drive yourself to the hospital; await an ambulance or designated driver.'
    ],
    emergencyPhone: '0904040364',
    secondaryPhone: '0931325959',
    description: 'Chest pain or heavy chest pressure (crushing sensation radiating to the left arm, jaw, neck, or back) may indicate an acute myocardial infarction (heart attack) or pulmonary embolism requiring immediate emergency medical intervention.'
  },
  {
    keyword: 'difficulty breathing',
    matchedCategory: 'Respiratory Emergency',
    title: 'Severe Respiratory Distress / Difficulty Breathing',
    dangerLevel: 'CRITICAL_EMERGENCY',
    immediateActions: [
      'Sit upright and loosen any restrictive clothing around the chest and neck.',
      'If you have an emergency rescue inhaler (e.g. Salbutamol / Albuterol), administer immediately with a spacer if available.',
      'Call emergency services (907 / 911) or proceed immediately to the nearest emergency room.',
      'Try slow, pursed-lip breathing while awaiting emergency transport.',
      'Do NOT lie flat on your back.'
    ],
    emergencyPhone: '0904040364',
    secondaryPhone: '0931325959',
    description: 'Sudden, severe shortness of breath, gasping for air, inability to speak full sentences, or blue-tinted lips/nails indicates acute hypoxia or severe airway obstruction that requires emergency resuscitation.'
  },
  {
    keyword: 'shortness of breath',
    matchedCategory: 'Respiratory & Cardiac Emergency',
    title: 'Acute Shortness of Breath',
    dangerLevel: 'CRITICAL_EMERGENCY',
    immediateActions: [
      'Sit upright immediately and remain calm to minimize oxygen consumption.',
      'Check for associated chest pressure, arm numbness, or blue discoloration.',
      'Use prescribed rescue inhalers if an asthma/COPD patient.',
      'Call emergency services (907 / 911) or your nearest clinical emergency facility.'
    ],
    emergencyPhone: '0904040364',
    secondaryPhone: '0931325959',
    description: 'Acute dyspnea (sudden shortness of breath) can be a sign of congestive heart failure, severe asthma exacerbation, pneumothorax, or pulmonary embolism.'
  },
  {
    keyword: 'slurred speech',
    matchedCategory: 'Neurological / Stroke Emergency',
    title: 'Possible Acute Stroke / Neurological Deficit',
    dangerLevel: 'CRITICAL_EMERGENCY',
    immediateActions: [
      'Perform the FAST check: Face drooping? Arm weakness? Speech slurred? Time to call emergency!',
      'Call emergency medical services (907 / 911) immediately without delay.',
      'Note the EXACT time the symptoms first started (critical for thrombolytic eligibility).',
      'Do NOT give food, drink, or any medications (including aspirin) as swallowing reflexes may be impaired.'
    ],
    emergencyPhone: '0904040364',
    secondaryPhone: '0931325959',
    description: 'Slurred speech, sudden facial asymmetry, or unilateral arm/leg weakness are cardinal signs of an acute ischemic or hemorrhagic stroke where every second counts to preserve brain tissue.'
  },
  {
    keyword: 'facial drooping',
    matchedCategory: 'Neurological / Stroke Emergency',
    title: 'Sudden Facial Drooping / One-Sided Weakness',
    dangerLevel: 'CRITICAL_EMERGENCY',
    immediateActions: [
      'Call emergency services (907 / 911) immediately.',
      'Keep the person lying flat with head slightly elevated if conscious.',
      'Record the exact symptom onset time.',
      'Do NOT give oral medications or fluids.'
    ],
    emergencyPhone: '0904040364',
    secondaryPhone: '0931325959',
    description: 'Sudden weakness or drooping on one side of the face is a medical emergency indicating a potential stroke or transient ischemic attack (TIA).'
  },
  {
    keyword: 'coughing blood',
    matchedCategory: 'Pulmonary / Vascular Emergency',
    title: 'Hemoptysis (Coughing up Blood)',
    dangerLevel: 'CRITICAL_EMERGENCY',
    immediateActions: [
      'Sit leaning forward to prevent blood from obstructing the airway.',
      'Seek emergency medical evaluation at a hospital immediately.',
      'Do not take cough suppressants or blood thinners without clinical supervision.',
      'Call 907 / 911 or visit the nearest emergency medical department.'
    ],
    emergencyPhone: '0904040364',
    secondaryPhone: '0931325959',
    description: 'Coughing up bright red blood or clots (hemoptysis) can signify acute pulmonary embolism, severe respiratory tract infection, cavitary tuberculosis, or vascular rupture.'
  },
  {
    keyword: 'loss of consciousness',
    matchedCategory: 'Critical Emergency',
    title: 'Loss of Consciousness / Severe Syncope',
    dangerLevel: 'CRITICAL_EMERGENCY',
    immediateActions: [
      'Check responsiveness and breathing; if not breathing, begin CPR immediately.',
      'Place in recovery position if breathing normally to keep the airway clear.',
      'Call emergency dispatch (907 / 911) immediately.',
      'Do NOT attempt to make the person sit up or give food/water until fully evaluated.'
    ],
    emergencyPhone: '0904040364',
    secondaryPhone: '0931325959',
    description: 'Unexplained syncope or loss of consciousness may be caused by cardiac arrhythmias, severe internal hemorrhage, severe hypoglycemia, or central nervous system events.'
  },
  {
    keyword: 'anaphylaxis',
    matchedCategory: 'Severe Allergic Emergency',
    title: 'Anaphylaxis / Severe Allergic Reaction',
    dangerLevel: 'CRITICAL_EMERGENCY',
    immediateActions: [
      'Administer Epinephrine auto-injector (EpiPen) into outer mid-thigh immediately if available.',
      'Call emergency medical services (907 / 911) right away.',
      'Lie flat with legs elevated unless breathing is difficult, in which case sit up.',
      'Avoid standing or walking abruptly.'
    ],
    emergencyPhone: '0904040364',
    secondaryPhone: '0931325959',
    description: 'Throat swelling, wheezing, diffuse hives, dizziness, and low blood pressure from an acute allergic reaction can become fatal within minutes without emergency epinephrine.'
  },
  {
    keyword: 'worst headache',
    matchedCategory: 'Neurological Emergency',
    title: 'Thunderclap Headache / Severe Sudden Cranial Pain',
    dangerLevel: 'CRITICAL_EMERGENCY',
    immediateActions: [
      'Seek emergency hospital evaluation immediately.',
      'Call emergency dispatch (907 / 911) or proceed to an emergency department.',
      'Avoid heavy painkillers that can mask intracranial bleeding before scan.'
    ],
    emergencyPhone: '0904040364',
    secondaryPhone: '0931325959',
    description: 'A sudden, explosive headache peaking within seconds ("worst headache of life") is a red flag for subarachnoid hemorrhage or aneurysm rupture.'
  }
];

export const CHRONIC_CONDITIONS: ChronicCondition[] = [
  {
    id: 'diabetes-mellitus-type-2',
    name: 'Type 2 Diabetes Mellitus',
    shortName: 'Type 2 Diabetes',
    category: 'Endocrine & Metabolic',
    categoryIcon: '🩸',
    aliases: ['Sugar', 'High Blood Sugar', 'Hyperglycemia', 'Diabetes', 'Type II Diabetes', 'Insulin Resistance'],
    searchKeywords: ['thirst', 'frequent urination', 'sugar', 'glucose', 'weight loss', 'blurry vision', 'hunger', 'fatigue', 'slow healing', 'tingling feet', 'neuropathy'],
    summary: 'A chronic metabolic disorder characterized by high blood glucose levels resulting from progressive insulin resistance and inadequate insulin secretion.',
    overview: 'Type 2 Diabetes is a widespread chronic condition where the pancreas either does not produce enough insulin or the body’s cells become resistant to insulin’s effects. Over time, persistently elevated blood glucose can damage blood vessels, nerves, kidneys, eyes, and the cardiovascular system. Proper long-term glycemic control through balanced diet, regular exercise, glucose monitoring, and medication prevents severe microvascular and macrovascular complications.',
    pathophysiology: 'Insulin resistance in skeletal muscle, adipose tissue, and liver combined with progressive beta-cell dysfunction leads to impaired glucose uptake and excessive hepatic glucose production.',
    commonSymptoms: [
      { name: 'Excessive Thirst (Polydipsia)', description: 'Constant feeling of intense thirst even after drinking plenty of fluids.', severity: 'common', category: 'Metabolic' },
      { name: 'Frequent Urination (Polyuria)', description: 'Frequent trips to the bathroom, especially throughout the night.', severity: 'common', category: 'Renal' },
      { name: 'Increased Hunger (Polyphagia)', description: 'Persistent feelings of hunger even after substantial meals.', severity: 'common', category: 'Metabolic' },
      { name: 'Unexplained Weight Loss', description: 'Losing weight without dieting due to loss of calories in urine and muscle breakdown.', severity: 'moderate', category: 'Metabolic' },
      { name: 'Chronic Fatigue & Lethargy', description: 'Persistent exhaustion because body cells are unable to properly utilize glucose for energy.', severity: 'common', category: 'Systemic' },
      { name: 'Blurred Vision', description: 'High blood sugar draws fluid from the lenses of the eyes, causing focus difficulties.', severity: 'moderate', category: 'Ocular' },
      { name: 'Slow-Healing Cuts & Sores', description: 'Impaired circulation and immune response cause minor abrasions or foot ulcers to heal very slowly.', severity: 'moderate', category: 'Dermatological' },
      { name: 'Tingling or Numbness (Peripheral Neuropathy)', description: 'Pins-and-needles sensation, burning, or loss of sensation in the feet and toes.', severity: 'severe', category: 'Neurological' }
    ],
    whenToSeeDoctor: [
      {
        urgency: 'routine',
        title: 'Initial Screening & Annual Checkups',
        description: 'Have Fasting Plasma Glucose (FPG) or HbA1c tested if you have a family history, are over 35, or have excess abdominal weight.'
      },
      {
        urgency: 'prompt',
        title: 'Persistent Symptoms or Foot Lesions',
        description: 'Contact your physician promptly if you develop foot blisters, numbness, non-healing ulcers, vision changes, or frequent urinary tract infections.'
      },
      {
        urgency: 'emergency',
        title: 'Severe Hyperglycemia / Ketosis Warning Signs',
        description: 'Seek emergency care immediately if blood glucose is > 350 mg/dL accompanied by nausea, vomiting, deep rapid breathing, fruity breath odor, or mental confusion (signs of Hyperosmolar Hyperglycemic State or DKA).'
      }
    ],
    emergencyTriggers: [
      'Severe hypoglycemia (blood sugar < 55 mg/dL) with confusion, fainting, or seizures.',
      'Diabetic Ketoacidosis (DKA) symptoms: fruity breath, vomiting, rapid labored breathing, extreme drowsiness.',
      'Blackening, foul discharge, or severe swelling around toes/feet indicating acute diabetic gangrene.'
    ],
    lifestyleAndSelfCare: [
      'Follow a balanced diet rich in whole grains, fiber, and lean proteins while minimizing refined sugars and sugary beverages.',
      'Engage in at least 150 minutes of moderate aerobic exercise (brisk walking, swimming, cycling) per week.',
      'Perform daily visual foot inspections for blisters, redness, cuts, or calluses using a mirror if needed.',
      'Maintain regular home glucose monitoring (Fasting target: 80–130 mg/dL; Post-meal target: < 180 mg/dL as advised by your doctor).'
    ],
    pharmacistGuidance: [
      'Take oral antidiabetics (like Metformin) with meals to minimize gastrointestinal discomfort.',
      'Always keep fast-acting carbohydrates (glucose tablets, fruit juice, honey) readily available to treat sudden hypoglycemia.',
      'Store unopened insulin pens and vials in the refrigerator (2°C–8°C); keep active in-use pens at room temperature away from direct sunlight.',
      'Have your HbA1c checked every 3 to 6 months and undergo an annual dilated eye examination.'
    ],
    commonMedicationClasses: [
      { name: 'Biguanides', purpose: 'Decreases hepatic glucose production and increases insulin sensitivity', example: 'Metformin (Glucophage)' },
      { name: 'Sulfonylureas', purpose: 'Stimulates pancreatic beta-cells to release more insulin', example: 'Glibenclamide, Glimepiride' },
      { name: 'SGLT-2 Inhibitors', purpose: 'Promotes renal glucose excretion through urine', example: 'Empagliflozin, Dapagliflozin' },
      { name: 'DPP-4 Inhibitors', purpose: 'Enhances incretin hormone levels to regulate insulin release', example: 'Sitagliptin, Vildagliptin' },
      { name: 'Insulins', purpose: 'Replaces or supplements natural insulin supply', example: 'Regular Human Insulin, Insulin Glargine' }
    ],
    sourceCitations: [
      {
        organization: 'World Health Organization (WHO)',
        title: 'Global Report on Diabetes & Clinical Management Guidelines',
        year: '2024',
        url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes',
        notes: 'Defines diagnostic criteria for Fasting Blood Glucose (≥7.0 mmol/L or 126 mg/dL) and HbA1c (≥6.5%).'
      },
      {
        organization: 'American Diabetes Association (ADA)',
        title: 'Standards of Care in Diabetes — Comprehensive Clinical Practice',
        year: '2024',
        notes: 'Authoritative guidance on cardiovascular risk reduction and individualized glycemic targets.'
      },
      {
        organization: 'Ethiopian Ministry of Health (FMoH / EFDA)',
        title: 'National Guidelines for the Management of Non-Communicable Diseases',
        year: '2023',
        notes: 'Primary healthcare protocols for essential medicines and diabetic monitoring across Ethiopian clinics.'
      }
    ]
  },
  {
    id: 'hypertension-high-blood-pressure',
    name: 'Hypertension (High Blood Pressure)',
    shortName: 'Hypertension',
    category: 'Cardiovascular',
    categoryIcon: '🫀',
    aliases: ['High Blood Pressure', 'BP', 'High BP', 'Hypertensive Disease', 'Elevated Pressure'],
    searchKeywords: ['blood pressure', 'hypertension', 'headache', 'dizziness', 'nosebleed', 'flushing', 'tinnitus', 'chest tightness', 'heart racing'],
    summary: 'A common chronic cardiovascular condition where the long-term force of blood against artery walls is consistently elevated (≥ 140/90 mmHg).',
    overview: 'Known as the "silent killer," hypertension often develops over many years without noticeable symptoms until significant organ damage has occurred. Uncontrolled high blood pressure is the leading risk factor for stroke, myocardial infarction, heart failure, peripheral artery disease, and chronic kidney failure. Routine blood pressure screening and steady adherence to lifestyle measures and antihypertensive pharmacotherapy are crucial.',
    pathophysiology: 'Increased systemic vascular resistance, excess intravascular volume, renin-angiotensin-aldosterone system (RAAS) overactivation, and sympathetic nervous system hyperactivity lead to arterial wall hypertrophy and stiffness.',
    commonSymptoms: [
      { name: 'Often Asymptomatic ("Silent")', description: 'Most individuals experience zero early warning signs, which is why regular screening is critical.', severity: 'common', category: 'General' },
      { name: 'Morning Occipital Headaches', description: 'Dull headaches felt primarily at the back of the head upon waking in moderate-to-severe elevations.', severity: 'occasional', category: 'Neurological' },
      { name: 'Lightheadedness & Dizziness', description: 'Feelings of unsteadiness or vertigo during posture changes.', severity: 'occasional', category: 'Neurological' },
      { name: 'Nosebleeds (Epistaxis)', description: 'Spontaneous nosebleeds can occur when blood vessels in the nasal septum rupture under high pressure.', severity: 'occasional', category: 'Vascular' },
      { name: 'Pulsatile Tinnitus', description: 'Rhythmic whooshing or throbbing sound in the ears synchronized with the heartbeat.', severity: 'occasional', category: 'Auditory' },
      { name: 'Shortness of Breath on Exertion', description: 'Reduced exercise tolerance due to increased left ventricular workload.', severity: 'moderate', category: 'Cardiovascular' }
    ],
    whenToSeeDoctor: [
      {
        urgency: 'routine',
        title: 'Routine Blood Pressure Screenings',
        description: 'Have your BP measured at least twice a year at any Michu Pharmacy branch or health clinic. Target is generally < 130/80 mmHg.'
      },
      {
        urgency: 'prompt',
        title: 'Consistently Elevated Readings (140-179 mmHg systolic)',
        description: 'If consecutive home readings over several days exceed 140/90 mmHg, schedule a medical consultation for medication adjustment.'
      },
      {
        urgency: 'emergency',
        title: 'Hypertensive Crisis (BP ≥ 180/120 mmHg with Symptoms)',
        description: 'If BP is ≥ 180/120 mmHg accompanied by chest pain, shortness of breath, blurred vision, back pain, or numbness, call 907 / 911 immediately.'
      }
    ],
    emergencyTriggers: [
      'Systolic blood pressure > 180 mmHg or diastolic > 120 mmHg with acute chest pain or neurological deficit.',
      'Sudden severe headache accompanied by vomiting, confusion, or visual loss.',
      'Signs of acute pulmonary edema: coughing pink frothy sputum, inability to lie flat, extreme breathlessness.'
    ],
    lifestyleAndSelfCare: [
      'Adopt the DASH (Dietary Approaches to Stop Hypertension) dietary pattern: rich in fruits, vegetables, potassium, and low in saturated fats.',
      'Restrict dietary sodium (salt) intake to less than 2,000 mg/day (under 1 teaspoon of table salt).',
      'Maintain regular aerobic physical activity: 30 minutes of moderate exercise 5 days a week.',
      'Limit alcohol intake and completely cease tobacco/smoking to protect arterial endothelial health.'
    ],
    pharmacistGuidance: [
      'Take your blood pressure medication at the exact same time every day; never abruptly stop taking beta-blockers or ACE inhibitors.',
      'Avoid over-the-counter decongestants (pseudoephedrine) and high doses of NSAIDs (ibuprofen, diclofenac) as they can elevate BP.',
      'Measure your BP after resting quietly for 5 minutes, with your arm supported at heart level and feet flat on the floor.',
      'Michu Pharmacy offers free blood pressure checks at all branch locations.'
    ],
    commonMedicationClasses: [
      { name: 'Calcium Channel Blockers (CCBs)', purpose: 'Relaxes and widens arterial blood vessels', example: 'Amlodipine, Nifedipine' },
      { name: 'ACE Inhibitors', purpose: 'Blocks formation of angiotensin II, relaxing vascular smooth muscle', example: 'Enalapril, Lisinopril, Ramipril' },
      { name: 'Angiotensin Receptor Blockers (ARBs)', purpose: 'Prevents angiotensin II from binding to receptors', example: 'Losartan, Telmisartan, Candesartan' },
      { name: 'Thiazide Diuretics', purpose: 'Increases sodium and water excretion to reduce fluid volume', example: 'Hydrochlorothiazide (HCTZ)' },
      { name: 'Beta Blockers', purpose: 'Reduces heart rate and cardiac output', example: 'Atenolol, Bisoprolol, Metoprolol' }
    ],
    sourceCitations: [
      {
        organization: 'World Health Organization (WHO)',
        title: 'Guideline for the Pharmacological Treatment of Hypertension in Adults',
        year: '2023',
        url: 'https://www.who.int/publications/i/item/9789240033986',
        notes: 'Recommends initiating combination therapy for individuals with baseline BP ≥ 140/90 mmHg.'
      },
      {
        organization: 'International Society of Hypertension (ISH)',
        title: 'Global Hypertension Practice Guidelines',
        year: '2023',
        notes: 'Provides practical recommendations on lifestyle modifications and threshold diagnostics.'
      },
      {
        organization: 'Ethiopian Heart Association & EFDA',
        title: 'Clinical Practice Protocol for Cardiovascular Disease Management',
        year: '2024',
        notes: 'National standards for frontline hypertension screening and medication availability.'
      }
    ]
  },
  {
    id: 'bronchial-asthma',
    name: 'Bronchial Asthma',
    shortName: 'Asthma',
    category: 'Respiratory',
    categoryIcon: '🫁',
    aliases: ['Asthma', 'Chronic Bronchospasm', 'Wheezing Illness', 'Allergic Asthma', 'Exercise-Induced Asthma'],
    searchKeywords: ['asthma', 'wheezing', 'short of breath', 'inhaler', 'chest tightness', 'cough at night', 'allergies', 'dust allergy', 'salbutamol', 'cold air'],
    summary: 'A chronic inflammatory disease of the airways that causes recurring episodes of wheezing, breathlessness, chest tightness, and nighttime coughing.',
    overview: 'Asthma causes hyperreactive bronchial airways that swell, narrow, and produce excess mucus in response to various triggers (allergens, cold air, viral infections, exercise, or smoke). Asthma severity varies from mild intermittent symptoms to life-threatening exacerbations. Most patients can achieve complete symptom control and lead active lives with a combination of daily controller inhalers (inhaled corticosteroids) and fast-acting rescue bronchodilators.',
    pathophysiology: 'Chronic airway inflammation driven by eosinophils, T-lymphocytes, and mast cells leads to bronchial hyperresponsiveness, smooth muscle contraction, mucosal edema, and mucous plugging.',
    commonSymptoms: [
      { name: 'Wheezing', description: 'A distinctive high-pitched whistling sound during exhalation when breathing out.', severity: 'common', category: 'Acoustic' },
      { name: 'Shortness of Breath', description: 'Feeling unable to catch one’s breath or take a full, deep breath.', severity: 'common', category: 'Respiratory' },
      { name: 'Chest Tightness', description: 'A sensation as if a band or heavy weight is squeezing the chest.', severity: 'common', category: 'Sensory' },
      { name: 'Nocturnal & Early Morning Coughing', description: 'Persistent dry or mucous cough that worsens at night or in the early morning hours.', severity: 'common', category: 'Respiratory' },
      { name: 'Exercise-Induced Breathlessness', description: 'Coughing or wheezing triggered within 5–15 minutes of vigorous physical activity.', severity: 'moderate', category: 'Functional' }
    ],
    whenToSeeDoctor: [
      {
        urgency: 'routine',
        title: 'Periodic Asthma Control Review',
        description: 'Review your Asthma Action Plan and inhaler technique with your doctor or pharmacist every 6–12 months.'
      },
      {
        urgency: 'prompt',
        title: 'Frequent Rescue Inhaler Usage',
        description: 'If you need your blue rescue inhaler (Salbutamol) more than 2–3 times per week, your asthma is poorly controlled and requires anti-inflammatory step-up.'
      },
      {
        urgency: 'emergency',
        title: 'Severe Acute Asthma Exacerbation',
        description: 'Call 907 / 911 or visit emergency immediately if rescue inhaler gives no relief, lips turn bluish, ribs pull in during breathing (retractions), or you cannot speak in full sentences.'
      }
    ],
    emergencyTriggers: [
      'Inability to speak complete sentences without gasping for breath.',
      'Rescue inhaler (Salbutamol 4-8 puffs) fails to relieve symptoms within 10 minutes.',
      'Cyanosis (blue or gray coloring around the lips, tongue, or fingertips).',
      'Silent chest: severe exhaustion where wheezing stops due to virtually no air movement.'
    ],
    lifestyleAndSelfCare: [
      'Identify and minimize exposure to personal triggers (house dust mites, mold, animal dander, pollen, chemical fumes, cold air).',
      'Never smoke and avoid indoor secondhand smoke, incense smoke, or wood stove particulates.',
      'Use a spacer device with metered-dose inhalers (MDIs) to maximize medication deposition into the lungs.',
      'Warm up thoroughly before exercise and keep your rescue inhaler accessible during workouts.'
    ],
    pharmacistGuidance: [
      'Understand the difference: Inhaled Steroids (e.g. Beclomethasone, Budesonide) PREVENT symptoms daily, while Salbutamol only RELIEVES sudden attacks.',
      'Always rinse your mouth with water and spit it out after using corticosteroid inhalers to prevent oral thrush and hoarseness.',
      'Check the dose counter on your inhaler regularly to ensure you do not run out during an emergency.',
      'Keep a peak flow meter log if recommended by your physician to track airway status.'
    ],
    commonMedicationClasses: [
      { name: 'Short-Acting Beta2 Agonists (SABA)', purpose: 'Rapid bronchodilation for acute relief', example: 'Salbutamol (Ventolin), Levalbuterol' },
      { name: 'Inhaled Corticosteroids (ICS)', purpose: 'Daily anti-inflammatory foundation to prevent swelling', example: 'Beclomethasone, Budesonide, Fluticasone' },
      { name: 'Long-Acting Beta2 Agonists (LABA) + ICS', purpose: 'Sustained 12-24hr airway maintenance', example: 'Formoterol + Budesonide (Symbicort), Salmeterol + Fluticasone (Seretide)' },
      { name: 'Leukotriene Receptor Antagonists', purpose: 'Oral anti-inflammatory tablet for allergic airway control', example: 'Montelukast (Singulair)' }
    ],
    sourceCitations: [
      {
        organization: 'Global Initiative for Asthma (GINA)',
        title: 'Global Strategy for Asthma Management and Prevention',
        year: '2024',
        url: 'https://ginasthma.org/',
        notes: 'Emphasizes that all adults with asthma should receive anti-inflammatory containing therapy to reduce severe exacerbation risk.'
      },
      {
        organization: 'World Health Organization (WHO)',
        title: 'Asthma Fact Sheet & Essential Medicine Priorities',
        year: '2023',
        url: 'https://www.who.int/news-room/fact-sheets/detail/asthma'
      },
      {
        organization: 'Ethiopian Thoracic Society',
        title: 'Management of Obstructive Airway Diseases in East Africa',
        year: '2023',
        notes: 'Practical regional guidance for inhaler access and environmental trigger remediation.'
      }
    ]
  },
  {
    id: 'copd-chronic-obstructive-pulmonary-disease',
    name: 'Chronic Obstructive Pulmonary Disease (COPD)',
    shortName: 'COPD',
    category: 'Respiratory',
    categoryIcon: '💨',
    aliases: ['Emphysema', 'Chronic Bronchitis', 'Smoker’s Cough', 'Chronic Airflow Limitation'],
    searchKeywords: ['copd', 'emphysema', 'chronic cough', 'phlegm', 'short of breath', 'smokers cough', 'biomass smoke', 'wheeze', 'oxygen', 'tired lungs'],
    summary: 'A progressive lung disease characterized by long-term breathing difficulty and persistent airflow limitation, commonly associated with chronic bronchitis and emphysema.',
    overview: 'COPD is a progressive, treatable lung disease caused primarily by long-term exposure to irritating gases or particulate matter, most commonly cigarette smoke and indoor biomass fuels (wood/charcoal cooking smoke). It leads to chronic destruction of lung parenchyma (emphysema) and permanent inflammation of the bronchial tubes (chronic bronchitis). Early diagnosis, smoking cessation, pulmonary rehabilitation, and bronchodilators can slow progression and improve quality of life.',
    pathophysiology: 'Chronic inhalation of toxic particles induces macrophage and neutrophil recruitment, release of elastases, loss of alveolar elasticity, hypersecretion of mucus, and small airway fibrosis.',
    commonSymptoms: [
      { name: 'Progressive Shortness of Breath (Dyspnea)', description: 'Breathlessness that starts during exertion (climbing stairs) and gradually progresses to rest.', severity: 'common', category: 'Functional' },
      { name: 'Chronic Daily Cough', description: 'Long-standing cough that produces significant sputum (mucus/phlegm), often called smoker’s cough.', severity: 'common', category: 'Respiratory' },
      { name: 'Excessive Sputum Production', description: 'Frequent clearing of thick clear, white, or discolored mucus from the lungs.', severity: 'common', category: 'Secretory' },
      { name: 'Frequent Respiratory Infections', description: 'Recurrent bouts of bronchitis or pneumonia during seasonal weather shifts.', severity: 'moderate', category: 'Infectious' },
      { name: 'Fatigue & Muscle Weakness', description: 'General weakness due to the extra metabolic effort required to breathe and systemic hypoxia.', severity: 'moderate', category: 'Systemic' },
      { name: 'Unintended Weight Loss in Advanced Stages', description: 'Loss of muscle mass from chronic respiratory workload and reduced appetite.', severity: 'severe', category: 'Nutritional' }
    ],
    whenToSeeDoctor: [
      {
        urgency: 'routine',
        title: 'Diagnostic Spirometry',
        description: 'Anyone over 40 with a history of smoking or biomass smoke exposure and chronic cough should undergo spirometry lung function testing.'
      },
      {
        urgency: 'prompt',
        title: 'Acute Exacerbation (Flare-Up)',
        description: 'Seek medical care promptly if sputum increases in volume or turns green/brown, or if breathlessness worsens beyond baseline.'
      },
      {
        urgency: 'emergency',
        title: 'Severe Respiratory Failure',
        description: 'Call 907 / 911 immediately if experiencing severe drowsiness, blue fingernails, inability to catch breath while sitting still, or chest pain.'
      }
    ],
    emergencyTriggers: [
      'Severe acute breathlessness unresponsive to emergency nebulization or inhalers.',
      'Signs of carbon dioxide retention: severe confusion, lethargy, morning stupor, bounding pulse.',
      'Cyanosis and oxygen saturation dropping below 88% on room air.'
    ],
    lifestyleAndSelfCare: [
      'Immediate and complete cessation of all tobacco smoking — the single most effective intervention to halt disease progression.',
      'Ensure proper kitchen ventilation and switch to clean cooking fuels away from indoor wood/charcoal smoke.',
      'Stay physically active through pulmonary rehabilitation exercises and daily walking.',
      'Receive annual influenza and pneumococcal vaccinations to prevent severe respiratory infections.'
    ],
    pharmacistGuidance: [
      'Master inhaler technique with your pharmacist; use long-acting muscarinic antagonists (LAMA) or LABA inhalers consistently as prescribed.',
      'Maintain an emergency supply of rescue bronchodilators (Ipratropium + Salbutamol) and know your exacerbation action plan.',
      'Drink plenty of fluids (unless on fluid restrictions) to help thin mucus secretions.',
      'Avoid high altitudes or extreme cold weather without proper respiratory protection.'
    ],
    commonMedicationClasses: [
      { name: 'Long-Acting Muscarinic Antagonists (LAMA)', purpose: 'Relaxes smooth muscle and reduces mucus hypersecretion', example: 'Tiotropium (Spiriva), Umeclidinium' },
      { name: 'Long-Acting Beta2 Agonists (LABA)', purpose: 'Sustained bronchodilation', example: 'Salmeterol, Formoterol, Indacaterol' },
      { name: 'Short-Acting Bronchodilators (SABA/SAMA)', purpose: 'Emergency rescue from acute bronchospasm', example: 'Salbutamol + Ipratropium (Combivent)' },
      { name: 'Phosphodiesterase-4 Inhibitors', purpose: 'Reduces exacerbation frequency in severe chronic bronchitis', example: 'Roflumilast' }
    ],
    sourceCitations: [
      {
        organization: 'Global Initiative for Chronic Obstructive Lung Disease (GOLD)',
        title: 'Global Strategy for the Diagnosis, Management, and Prevention of COPD',
        year: '2024',
        url: 'https://goldcopd.org/',
        notes: 'Defines ABCD assessment criteria and pharmacotherapy escalation.'
      },
      {
        organization: 'World Health Organization (WHO)',
        title: 'Chronic Obstructive Pulmonary Disease (COPD) Fact Sheet',
        year: '2023',
        url: 'https://www.who.int/news-room/fact-sheets/detail/chronic-obstructive-pulmonary-disease-(copd)'
      }
    ]
  },
  {
    id: 'chronic-kidney-disease-ckd',
    name: 'Chronic Kidney Disease (CKD)',
    shortName: 'Chronic Kidney Disease',
    category: 'Endocrine & Metabolic',
    categoryIcon: '🩺',
    aliases: ['CKD', 'Renal Impairment', 'Kidney Failure', 'Chronic Renal Disease', 'Nephropathy'],
    searchKeywords: ['kidney', 'ckd', 'swollen ankles', 'foamy urine', 'creatinine', 'urea', 'edema', 'fatigue', 'high blood pressure', 'metallic taste', 'itchy skin'],
    summary: 'A progressive loss of renal function over months or years, leading to buildup of fluids, electrolytes, and metabolic wastes in the bloodstream.',
    overview: 'Chronic Kidney Disease involves gradual deterioration of the nephrons that filter waste and excess water from the blood. Diabetes and hypertension account for over 70% of CKD cases worldwide. In the early stages (Stages 1–3), patients are frequently symptom-free. As filtration drops below critical levels, fluid retention (edema), anemia, electrolyte imbalances, and uremic symptoms emerge. Early detection through urine albumin and serum creatinine tests allows life-preserving management.',
    pathophysiology: 'Glomerular hyperfiltration and nephron loss lead to glomerulosclerosis, tubulointerstitial fibrosis, decreased Glomerular Filtration Rate (eGFR), and impaired renin/erythropoietin synthesis.',
    commonSymptoms: [
      { name: 'Early Stages Asymptomatic', description: 'Kidney function can drop by 50% or more without obvious physical warning signs.', severity: 'common', category: 'General' },
      { name: 'Swollen Feet, Ankles, & Eyes (Edema)', description: 'Fluid accumulation in lower extremities and periorbital puffiness upon waking.', severity: 'common', category: 'Vascular' },
      { name: 'Changes in Urination & Foamy Urine', description: 'Urinating more or less frequently, nocturia, and frothy/bubbly urine caused by protein leakage (albuminuria).', severity: 'common', category: 'Urinary' },
      { name: 'Persistent Fatigue & Anemia', description: 'Exhaustion caused by reduced renal erythropoietin production leading to low red blood cell counts.', severity: 'common', category: 'Hematological' },
      { name: 'Dry, Intensely Itchy Skin (Pruritus)', description: 'Buildup of mineral and uremic toxins in the blood causes generalized chronic skin itching.', severity: 'moderate', category: 'Dermatological' },
      { name: 'Metallic Taste & Ammonia Breath', description: 'Waste retention (uremia) makes food taste metallic and reduces appetite with nausea.', severity: 'moderate', category: 'Gastrointestinal' }
    ],
    whenToSeeDoctor: [
      {
        urgency: 'routine',
        title: 'Annual Screening for High-Risk Individuals',
        description: 'All patients with diabetes, hypertension, or a family history of kidney disease must get annual eGFR and Urine Albumin-to-Creatinine Ratio (uACR) tests.'
      },
      {
        urgency: 'prompt',
        title: 'Unexplained Swelling, Foamy Urine, or Rising BP',
        description: 'Consult a nephrologist or physician if noticing persistent pedal edema, visible frothy urine, or sudden blood pressure spikes.'
      },
      {
        urgency: 'emergency',
        title: 'Severe Uremic or Fluid Overload Signs',
        description: 'Seek emergency hospital care if experiencing inability to urinate (anuria), severe shortness of breath from pulmonary edema, irregular heartbeat, or severe confusion.'
      }
    ],
    emergencyTriggers: [
      'Complete cessation of urine output (anuria) for over 12 hours.',
      'Acute fluid overload with severe breathlessness (pulmonary edema).',
      'Severe hyperkalemia symptoms: muscle paralysis, severe weakness, cardiac palpitations.'
    ],
    lifestyleAndSelfCare: [
      'Strict blood pressure control (target < 130/80 mmHg) and rigorous glycemic control if diabetic.',
      'Follow a renal-friendly diet: monitor dietary protein, sodium, potassium, and phosphorus intake as guided by a clinical dietitian.',
      'Stay properly hydrated without excessive fluid overload.',
      'Avoid smoking, which accelerates vascular damage in renal capillaries.'
    ],
    pharmacistGuidance: [
      'CRITICAL: Avoid Over-The-Counter NSAIDs (Ibuprofen, Diclofenac, Naproxen) which are nephrotoxic and can cause acute kidney injury on top of CKD.',
      'Use Paracetamol as the preferred safe pain reliever within recommended limits.',
      'Always inform any prescribing doctor or pharmacist of your kidney disease stage so drug dosages can be adjusted to your eGFR.',
      'Take prescribed phosphate binders with meals and anemia medications (iron/erythropoietin) as scheduled.'
    ],
    commonMedicationClasses: [
      { name: 'SGLT2 Inhibitors', purpose: 'Cardio-renal protection, slows CKD progression and albuminuria', example: 'Dapagliflozin, Empagliflozin' },
      { name: 'ACE Inhibitors / ARBs', purpose: 'Reduces intraglomerular pressure and proteinuria', example: 'Enalapril, Losartan, Telmisartan' },
      { name: 'Phosphate Binders', purpose: 'Binds dietary phosphorus in gut to prevent hyperphosphatemia', example: 'Calcium Acetate, Sevelamer' },
      { name: 'Erythropoiesis-Stimulating Agents (ESAs)', purpose: 'Treats renal anemia by stimulating red blood cell production', example: 'Epoetin alfa, Darbepoetin' }
    ],
    sourceCitations: [
      {
        organization: 'Kidney Disease: Improving Global Outcomes (KDIGO)',
        title: 'KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of CKD',
        year: '2024',
        url: 'https://kdigo.org/guidelines/ckd-evaluation-and-management/',
        notes: 'Establishes international staging (G1-G5, A1-A3) and holistic nephroprotective drug regimens.'
      },
      {
        organization: 'National Kidney Foundation (NKF)',
        title: 'Clinical Guidance for Chronic Kidney Disease Detection and Treatment',
        year: '2023'
      }
    ]
  },
  {
    id: 'coronary-artery-disease-cad',
    name: 'Coronary Artery Disease (CAD)',
    shortName: 'Coronary Artery Disease',
    category: 'Cardiovascular',
    categoryIcon: '🫀',
    aliases: ['CAD', 'Ischemic Heart Disease', 'Coronary Atherosclerosis', 'Angina Pectoris', 'Heart Disease'],
    searchKeywords: ['heart', 'cad', 'angina', 'chest pressure', 'atherosclerosis', 'cholesterol', 'stent', 'bypass', 'left arm pain', 'sweating', 'heart attack'],
    summary: 'The narrowing or blockage of the coronary arteries that supply blood, oxygen, and nutrients to the heart muscle, typically caused by atherosclerotic plaque buildup.',
    overview: 'Coronary Artery Disease is the single most common type of heart disease worldwide. Over decades, cholesterol-containing deposits (plaques) and chronic vascular inflammation narrow the coronary arteries, reducing oxygen delivery to the myocardium. This can manifest as exertional chest discomfort (stable angina) or, if a plaque ruptures and forms a clot, sudden myocardial infarction (heart attack). Comprehensive prevention involves lipid lowering, antiplatelet therapy, blood pressure management, and cardiac lifestyle habits.',
    pathophysiology: 'Endothelial injury, LDL-cholesterol oxidation, foam cell accumulation, and fibrous cap formation result in coronary luminal stenosis and plaque instability.',
    commonSymptoms: [
      { name: 'Angina Pectoris (Chest Pressure/Ache)', description: 'Discomfort, heaviness, tightness, or burning sensation in the center of the chest provoked by exertion or emotional stress.', severity: 'common', category: 'Cardiovascular' },
      { name: 'Radiating Pain to Arm, Neck, or Jaw', description: 'Discomfort spreading from the chest into the left shoulder, arm, neck, jaw, or upper back.', severity: 'common', category: 'Referred Pain' },
      { name: 'Shortness of Breath on Minimal Exertion', description: 'Difficulty catching breath when walking uphill or climbing stairs.', severity: 'common', category: 'Functional' },
      { name: 'Cold Sweats (Diaphoresis)', description: 'Sudden profuse perspiration accompanied by nausea or clamminess.', severity: 'moderate', category: 'Autonomic' },
      { name: 'Fatigue & Reduced Exercise Tolerance', description: 'Disproportionate exhaustion during routine daily physical activities.', severity: 'common', category: 'Systemic' },
      { name: 'Atypical Symptoms in Women & Diabetics', description: 'Subtle presentation: shortness of breath, unexplained fatigue, indigestion, or dizziness without sharp chest pain.', severity: 'moderate', category: 'Special Group' }
    ],
    whenToSeeDoctor: [
      {
        urgency: 'routine',
        title: 'Cardiovascular Risk Stratification',
        description: 'Have your lipid profile (Total Cholesterol, LDL, HDL, Triglycerides) and blood pressure checked annually.'
      },
      {
        urgency: 'prompt',
        title: 'New or Changing Stable Angina',
        description: 'If you experience chest tightness during routine walking that subsides with rest, schedule an urgent cardiology consultation.'
      },
      {
        urgency: 'emergency',
        title: 'Suspected Heart Attack (Acute Coronary Syndrome)',
        description: 'Call 907 / 911 IMMEDIATELY if chest pain lasts > 5 minutes, occurs at rest, radiates to the arm/jaw, or is accompanied by cold sweat and nausea.'
      }
    ],
    emergencyTriggers: [
      'Crushing central chest pain lasting more than 5 minutes that does not resolve with rest.',
      'Chest tightness accompanied by syncope (fainting), severe breathlessness, or vomiting.',
      'Nitroglycerin fails to relieve chest pain after 1 tablet/spray within 5 minutes.'
    ],
    lifestyleAndSelfCare: [
      'Follow a Mediterranean-style or heart-healthy diet: emphasize olive oil, fish, legumes, vegetables, and drastically cut trans-fats and ultra-processed foods.',
      'Stop smoking and eliminate all exposure to secondhand smoke.',
      'Participate in medically supervised cardiac rehabilitation or regular moderate exercise (e.g. 30 min daily walking).',
      'Practice stress-management techniques (deep breathing, prayer, meditation) to lower adrenergic surges.'
    ],
    pharmacistGuidance: [
      'Take your daily low-dose Aspirin or Clopidogrel with food and never skip doses without cardiology approval.',
      'Take statins (Atorvastatin, Rosuvastatin) consistently at bedtime or evening to maximize cholesterol synthesis inhibition.',
      'Carry sublingual Nitroglycerin in its original amber glass container to protect it from light and moisture; do not take within 24-48 hours of PDE5 inhibitors (e.g. Sildenafil).',
      'Regularly monitor resting pulse and blood pressure.'
    ],
    commonMedicationClasses: [
      { name: 'Statins (HMG-CoA Reductase Inhibitors)', purpose: 'Lowers LDL-C and stabilizes atherosclerotic plaque', example: 'Atorvastatin, Rosuvastatin' },
      { name: 'Antiplatelet Agents', purpose: 'Prevents platelet aggregation and thrombus formation', example: 'Aspirin 81mg, Clopidogrel' },
      { name: 'Beta-Blockers', purpose: 'Decreases myocardial oxygen demand by reducing heart rate and contractility', example: 'Bisoprolol, Metoprolol, Atenolol' },
      { name: 'Nitrates', purpose: 'Direct coronary and systemic venous vasodilation for angina relief', example: 'Sublingual Nitroglycerin, Isosorbide Dinitrate' },
      { name: 'ACE Inhibitors', purpose: 'Cardiovascular remodeling prevention and BP control', example: 'Ramipril, Enalapril' }
    ],
    sourceCitations: [
      {
        organization: 'American College of Cardiology (ACC) / American Heart Association (AHA)',
        title: 'Guideline for the Management of Patients with Chronic Coronary Disease',
        year: '2023',
        url: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001168'
      },
      {
        organization: 'European Society of Cardiology (ESC)',
        title: 'Guidelines for the Management of Chronic Coronary Syndromes',
        year: '2024'
      },
      {
        organization: 'World Health Organization (WHO)',
        title: 'Cardiovascular Diseases (CVDs) Key Facts and Guidelines',
        year: '2023'
      }
    ]
  },
  {
    id: 'gerd-acid-reflux',
    name: 'Gastroesophageal Reflux Disease (GERD)',
    shortName: 'GERD (Acid Reflux)',
    category: 'Gastrointestinal',
    categoryIcon: '🧪',
    aliases: ['Acid Reflux', 'Heartburn', 'Reflux Esophagitis', 'Gastric Reflux', 'Acidity'],
    searchKeywords: ['gerd', 'acid reflux', 'heartburn', 'sour taste', 'regurgitation', 'bloating', 'chest burning', 'omeprazole', 'stomach burning', 'dysphagia'],
    summary: 'A chronic digestive disorder where stomach acid or bile frequently flows back into the esophagus, irritating the esophageal lining.',
    overview: 'GERD occurs when the Lower Esophageal Sphincter (LES) weakens or relaxes inappropriately, allowing caustic gastric acid and digestive enzymes to ascend into the gullet. While occasional heartburn is common, persistent reflux occurring more than twice a week is classified as GERD. Over time, untreated chronic acid exposure can cause erosive esophagitis, esophageal strictures, and Barrett’s esophagus. Lifestyle measures combined with acid suppression medications provide excellent symptomatic control.',
    pathophysiology: 'Transient lower esophageal sphincter relaxations (TLESRs), low LES resting tone, hiatal hernia, impaired esophageal clearance, and delayed gastric emptying.',
    commonSymptoms: [
      { name: 'Heartburn (Pyrosis)', description: 'A burning sensation in the chest behind the breastbone, usually occurring after eating and worsening when lying down or bending over.', severity: 'common', category: 'Sensory' },
      { name: 'Acid Regurgitation', description: 'Backflow of sour or bitter-tasting fluid or undigested food into the throat or mouth.', severity: 'common', category: 'Secretory' },
      { name: 'Difficulty Swallowing (Dysphagia)', description: 'Feeling that food is sticking in the throat or chest as a result of esophageal spasm or stricture.', severity: 'moderate', category: 'Mechanical' },
      { name: 'Chronic Dry Cough & Throat Clearing', description: 'Persistent cough or throat irritation caused by micro-aspiration of acidic vapors.', severity: 'occasional', category: 'Respiratory' },
      { name: 'Hoarseness or Laryngitis', description: 'Morning voice raspy or sore throat caused by acid irritating the vocal cords.', severity: 'occasional', category: 'ENT' },
      { name: 'Dental Enamel Erosion', description: 'Acid reflux reaching the oral cavity slowly erodes teeth enamel over months.', severity: 'moderate', category: 'Dental' }
    ],
    whenToSeeDoctor: [
      {
        urgency: 'routine',
        title: 'Mild Chronic Symptoms (> 2 times per week)',
        description: 'Discuss symptoms with a healthcare professional to initiate structured proton pump inhibitor (PPI) therapy and rule out gastritis/H. pylori.'
      },
      {
        urgency: 'prompt',
        title: 'Red-Flag Alarm Symptoms (Dysphagia, Weight Loss, Vomiting)',
        description: 'See a gastroenterologist promptly for an endoscopy (EGD) if you experience painful swallowing (odynophagia), difficulty swallowing solids, persistent vomiting, or anemia.'
      },
      {
        urgency: 'emergency',
        title: 'Severe Chest Discomfort Warning',
        description: 'If severe chest burning radiates to the left arm/neck, is accompanied by shortness of breath, or feels crushing, treat as a potential cardiac emergency (907 / 911).'
      }
    ],
    emergencyTriggers: [
      'Vomiting bright red blood or "coffee-ground" material (hematemesis).',
      'Black, tarry, foul-smelling stools (melena) indicating upper gastrointestinal hemorrhage.',
      'Inability to swallow liquids or acute food bolus impaction in the esophagus.'
    ],
    lifestyleAndSelfCare: [
      'Elevate the head of your bed by 15–20 cm (6–8 inches) using bed risers or a wedge pillow (extra standard pillows are not effective).',
      'Avoid lying down or reclining for at least 3 hours after completing a meal.',
      'Eat smaller, more frequent meals rather than large, heavy, fatty feasts.',
      'Identify and avoid personal trigger foods: spicy dishes, citrus, tomatoes, chocolate, caffeine, mint, carbonated drinks, and alcohol.',
      'Maintain a healthy weight to reduce intra-abdominal pressure on the stomach.'
    ],
    pharmacistGuidance: [
      'Take Proton Pump Inhibitors (Omeprazole, Esomeprazole, Pantoprazole) 30–60 minutes BEFORE breakfast on an empty stomach for maximum acid suppression.',
      'Antacids (Magnesium/Aluminum hydroxide) offer rapid 15-minute symptomatic relief but do not heal damaged esophageal tissue long-term.',
      'Do not self-medicate with over-the-counter PPIs continuously for more than 14 days without consulting a doctor.',
      'Avoid wearing excessively tight waistbands or tight belts that squeeze the stomach.'
    ],
    commonMedicationClasses: [
      { name: 'Proton Pump Inhibitors (PPIs)', purpose: 'Potent 24-hour suppression of gastric acid secretion', example: 'Omeprazole (Prilosec), Esomeprazole (Nexium), Pantoprazole' },
      { name: 'H2-Receptor Antagonists (H2RAs)', purpose: 'Reduces nighttime and basal acid production', example: 'Famotidine (Pepcid), Cimetidine' },
      { name: 'Antacids & Alginates', purpose: 'Neutralizes stomach acid and creates a protective physical raft', example: 'Gaviscon, Aluminum/Magnesium Hydroxide' },
      { name: 'Prokinetics', purpose: 'Enhances gastric emptying and LES tone', example: 'Domperidone, Metoclopramide' }
    ],
    sourceCitations: [
      {
        organization: 'American College of Gastroenterology (ACG)',
        title: 'Guidelines for the Diagnosis and Management of Gastroesophageal Reflux Disease',
        year: '2023',
        url: 'https://gi.org/guidelines/gerd/'
      },
      {
        organization: 'World Gastroenterology Organisation (WGO)',
        title: 'Global Guidelines on Gastroesophageal Reflux Disease',
        year: '2023'
      }
    ]
  },
  {
    id: 'rheumatoid-and-osteoarthritis',
    name: 'Arthritis (Osteoarthritis & Rheumatoid Arthritis)',
    shortName: 'Arthritis',
    category: 'Musculoskeletal',
    categoryIcon: '🦴',
    aliases: ['Joint Pain', 'Osteoarthritis', 'Rheumatoid Arthritis', 'Joint Stiffness', 'Rheumatism'],
    searchKeywords: ['arthritis', 'joint pain', 'knee pain', 'stiff fingers', 'swollen joints', 'osteoarthritis', 'rheumatoid', 'morning stiffness', 'cartilage', 'bone rubbing'],
    summary: 'Chronic joint disorders characterized by joint inflammation, pain, stiffness, and degeneration of articular cartilage, predominantly affecting knees, hips, hands, and spine.',
    overview: 'Arthritis encompasses over 100 conditions, with Osteoarthritis (degenerative "wear-and-tear" breakdown of cartilage) and Rheumatoid Arthritis (an autoimmune inflammatory disease targeting synovial membranes) being the most common. Chronic joint inflammation causes persistent pain, reduced range of motion, and physical disability. Modern management combines physical therapy, low-impact exercise, weight reduction, topical/oral analgesics, and disease-modifying antirheumatic drugs (DMARDs) for autoimmune forms.',
    pathophysiology: 'Osteoarthritis: mechanical wear, chondrocyte degradation, and subchondral bone remodeling. Rheumatoid Arthritis: autoantibodies (RF, anti-CCP), synovial pannus formation, and bone erosion.',
    commonSymptoms: [
      { name: 'Joint Pain & Aching', description: 'Pain in weight-bearing joints (knees, hips) during/after movement, or constant throbbing in inflammatory arthritis.', severity: 'common', category: 'Sensory' },
      { name: 'Morning Joint Stiffness', description: 'Stiffness lasting < 30 minutes in Osteoarthritis, or prolonged morning stiffness > 1 hour in Rheumatoid Arthritis.', severity: 'common', category: 'Functional' },
      { name: 'Joint Swelling, Warmth, & Tenderness', description: 'Fluid accumulation (effusion) and soft tissue swelling around affected joints.', severity: 'common', category: 'Inflammatory' },
      { name: 'Decreased Range of Motion', description: 'Inability to bend, straighten, or fully rotate the joint.', severity: 'common', category: 'Mechanical' },
      { name: 'Crepitus (Grating / Popping Sensation)', description: 'A grating sound or feeling when moving the joint caused by roughened cartilage surfaces.', severity: 'moderate', category: 'Mechanical' },
      { name: 'Joint Deformity & Bony Nodes', description: 'Enlarged knobby knuckles (Heberden’s and Bouchard’s nodes) in hand osteoarthritis, or ulnar drift in RA.', severity: 'moderate', category: 'Structural' }
    ],
    whenToSeeDoctor: [
      {
        urgency: 'routine',
        title: 'Initial Joint Evaluation & X-rays',
        description: 'Schedule a medical checkup if joint pain or stiffness persists for more than 2–3 weeks to establish a baseline diagnosis.'
      },
      {
        urgency: 'prompt',
        title: 'Symmetrical Swelling in Multiple Small Joints',
        description: 'See a rheumatologist quickly if hands, wrists, and feet are symmetrically swollen and warm, to begin early DMARD therapy before irreversible joint damage occurs.'
      },
      {
        urgency: 'emergency',
        title: 'Hot, Red, Acutely Swollen Single Joint (Septic Arthritis Rule-out)',
        description: 'A single joint that suddenly becomes intensely painful, fiery red, hot to touch, accompanied by high fever requires emergency hospital aspiration to rule out joint infection.'
      }
    ],
    emergencyTriggers: [
      'Acute monarthritis with high fever and chills (potential bacterial septic arthritis).',
      'Sudden loss of joint function or inability to bear any weight after minimal trauma.',
      'Severe systemic signs with Rheumatoid Arthritis: pleurisy, eye inflammation (scleritis), or vasculitic ulcers.'
    ],
    lifestyleAndSelfCare: [
      'Engage in low-impact joint-friendly exercises: swimming, water aerobics, stationary cycling, and Tai Chi.',
      'Achieve and maintain a healthy body weight: every 1 kg lost reduces knee joint load by approximately 4 kg.',
      'Use assistive devices (ergonomic jar openers, knee braces, walking canes on the opposite side) to protect vulnerable joints.',
      'Apply warm compresses or heating pads to ease morning stiffness, and ice packs to reduce acute post-activity swelling.'
    ],
    pharmacistGuidance: [
      'Topical NSAID gels (Diclofenac gel) provide targeted joint pain relief with significantly lower systemic gastrointestinal and renal risks compared to oral tablets.',
      'If using oral NSAIDs (Ibuprofen, Naproxen, Celecoxib), always take with food and consider a gastroprotective PPI if using for more than a few days.',
      'Do not exceed 4,000 mg of Paracetamol per 24 hours.',
      'For patients on Methotrexate or biologics, strictly attend routine liver function and complete blood count monitoring appointments.'
    ],
    commonMedicationClasses: [
      { name: 'Topical & Oral NSAIDs', purpose: 'Reduces acute joint inflammation and analgesic relief', example: 'Diclofenac gel (Voltaren), Celecoxib, Naproxen' },
      { name: 'Conventional DMARDs', purpose: 'Suppresses autoimmune joint destruction in Rheumatoid Arthritis', example: 'Methotrexate, Hydroxychloroquine, Sulfasalazine' },
      { name: 'Biologic Agents & JAK Inhibitors', purpose: 'Targeted cytokine inhibition (anti-TNF) for severe RA', example: 'Adalimumab, Infliximab, Tofacitinib' },
      { name: 'Intra-articular Corticosteroids', purpose: 'Direct joint injection for rapid flare relief', example: 'Triamcinolone hexacetonide' }
    ],
    sourceCitations: [
      {
        organization: 'American College of Rheumatology (ACR)',
        title: 'Guideline for the Management of Osteoarthritis of the Hand, Hip, and Knee',
        year: '2023',
        url: 'https://rheumatology.org/clinical-practice-guidelines'
      },
      {
        organization: 'European Alliance of Associations for Rheumatology (EULAR)',
        title: 'Recommendations for the Management of Rheumatoid Arthritis',
        year: '2023'
      },
      {
        organization: 'World Health Organization (WHO)',
        title: 'Musculoskeletal Conditions Fact Sheet',
        year: '2023'
      }
    ]
  },
  {
    id: 'hypothyroidism-thyroid-disorders',
    name: 'Hypothyroidism (Underactive Thyroid)',
    shortName: 'Hypothyroidism',
    category: 'Endocrine & Metabolic',
    categoryIcon: '🦋',
    aliases: ['Underactive Thyroid', 'Low Thyroid', 'Thyroid Deficiency', 'Hashimoto Thyroiditis', 'Goiter'],
    searchKeywords: ['thyroid', 'hypothyroidism', 'fatigue', 'weight gain', 'cold intolerance', 'dry skin', 'hair loss', 'constipation', 'levothyroxine', 'tsh', 'puffy face'],
    summary: 'An endocrine disorder in which the thyroid gland does not produce enough crucial thyroid hormones (T3 and T4), slowing down the entire body’s metabolism.',
    overview: 'The thyroid gland, located in the anterior neck, regulates energy expenditure, cardiac rhythm, body temperature, and metabolic rate. When thyroid hormone synthesis is deficient (most commonly due to autoimmune Hashimoto’s thyroiditis or iodine deficiency), virtually every bodily organ slows down. Symptoms develop insidiously over months or years. Daily oral replacement therapy with synthetic Levothyroxine restores normal hormone levels and resolves symptoms effectively.',
    pathophysiology: 'Autoimmune destruction of thyroid follicular cells or insufficient pituitary TSH stimulation leads to diminished circulating Free T4/T3 and elevated Serum Thyroid-Stimulating Hormone (TSH).',
    commonSymptoms: [
      { name: 'Chronic Fatigue & Sluggishness', description: 'Persistent tiredness and low energy despite adequate sleep.', severity: 'common', category: 'Systemic' },
      { name: 'Unexplained Weight Gain & Fluid Retention', description: 'Difficulty losing weight or modest weight gain despite no change in diet.', severity: 'common', category: 'Metabolic' },
      { name: 'Cold Sensitivity (Cold Intolerance)', description: 'Feeling constantly cold when others around you are comfortable.', severity: 'common', category: 'Thermoregulatory' },
      { name: 'Constipation', description: 'Slowed gastrointestinal motility leading to infrequent and hard bowel movements.', severity: 'common', category: 'Gastrointestinal' },
      { name: 'Dry Skin & Brittle Hair/Nails', description: 'Coarse, dry, flaky skin, thinning eyebrows, and hair shedding.', severity: 'moderate', category: 'Dermatological' },
      { name: 'Muscle Aches, Weakness, & Cramps', description: 'Stiffness and generalized muscle tenderness, particularly in shoulders and hips.', severity: 'moderate', category: 'Musculoskeletal' },
      { name: 'Depressed Mood & Brain Fog', description: 'Slowed cognitive processing, impaired memory, and depressive symptoms.', severity: 'moderate', category: 'Psychiatric' }
    ],
    whenToSeeDoctor: [
      {
        urgency: 'routine',
        title: 'Diagnostic Thyroid Function Panel (TSH, Free T4)',
        description: 'If you experience unexplained weight gain, constant fatigue, and cold intolerance, ask your doctor for a blood TSH test.'
      },
      {
        urgency: 'prompt',
        title: 'Dose Titration and Pregnancy',
        description: 'Thyroid hormone requirements increase significantly during pregnancy; notify your physician immediately if pregnant or planning to conceive.'
      },
      {
        urgency: 'emergency',
        title: 'Myxedema Coma Warning Signs',
        description: 'A life-threatening complication of severe untreated hypothyroidism: hypothermia (< 35°C), extreme lethargy/stupor, slow heart rate, and hypoventilation requires immediate intensive care.'
      }
    ],
    emergencyTriggers: [
      'Myxedema coma: severe hypothermia, unresponsiveness, slow shallow breathing, hypotension.',
      'Severe bradycardia (heart rate < 40 bpm) with fainting or chest pain.',
      'Signs of severe over-replacement: palpitations, chest pain, tremors, insomnia (thyrotoxicosis).'
    ],
    lifestyleAndSelfCare: [
      'Ensure adequate dietary iodine intake by using iodized table salt.',
      'Maintain a high-fiber diet and drink ample water to counter sluggish bowel motility and constipation.',
      'Keep a symptom journal when initiating or adjusting thyroid medication.',
      'Schedule regular blood checkups every 6–12 weeks until TSH stabilizes, and annually thereafter.'
    ],
    pharmacistGuidance: [
      'GOLDEN RULE: Take Levothyroxine ON AN EMPTY STOMACH with a full glass of plain water at least 30–60 minutes BEFORE breakfast.',
      'Wait at least 4 hours before taking Calcium, Iron supplements, Multivitamins, Antacids, or Soy products, as they severely bind and block Levothyroxine absorption.',
      'Do not switch between different brand/generic formulations without doctor/pharmacist knowledge as minor potency variations affect TSH levels.',
      'Levothyroxine takes 4 to 6 weeks to reach steady state therapeutic effect.'
    ],
    commonMedicationClasses: [
      { name: 'Synthetic Levothyroxine (L-T4)', purpose: 'Synthetic T4 replacement to restore physiological circulating levels', example: 'Levothyroxine (Eltroxin, Synthroid, Euthyrox)' },
      { name: 'Synthetic Liothyronine (L-T3)', purpose: 'Rapid-acting T3 supplement for select specialist cases', example: 'Liothyronine (Cytomel)' },
      { name: 'Iodine Supplements', purpose: 'Restores iodine substrate in endemic goiter regions', example: 'Potassium Iodide' }
    ],
    sourceCitations: [
      {
        organization: 'American Thyroid Association (ATA)',
        title: 'Clinical Practice Guidelines for Hypothyroidism in Adults',
        year: '2023',
        url: 'https://www.thyroid.org/professionals/ata-professional-guidelines/'
      },
      {
        organization: 'Endocrine Society',
        title: 'Clinical Practice Guidelines on Management of Thyroid Dysfunction',
        year: '2024'
      },
      {
        organization: 'World Health Organization (WHO)',
        title: 'Assessment of Iodine Deficiency Disorders and Monitoring their Elimination',
        year: '2023'
      }
    ]
  },
  {
    id: 'chronic-migraine-and-headaches',
    name: 'Migraine & Chronic Headache Disorders',
    shortName: 'Migraine Disorders',
    category: 'Neurological',
    categoryIcon: '🧠',
    aliases: ['Migraine', 'Tension Headache', 'Chronic Headache', 'Vascular Headache', 'Hemicephaly'],
    searchKeywords: ['headache', 'migraine', 'throbbing head', 'aura', 'light sensitive', 'sound sensitive', 'nausea', 'triptans', 'head pain', 'temple throbbing'],
    summary: 'A debilitating neurological condition characterized by recurrent, moderate-to-severe throbbing headaches typically on one side of the head, often accompanied by nausea and sensory hypersensitivity.',
    overview: 'Migraine is one of the top causes of disability worldwide. Attacks typically last from 4 to 72 hours and can be divided into four phases: prodrome (premonitory symptoms), aura (visual or sensory distortions in 25–30% of patients), headache attack, and postdrome ("migraine hangover"). Chronic migraine is diagnosed when headaches occur on 15 or more days per month for at least 3 months. Effective treatment utilizes abortive therapies (triptans, NSAIDs) taken at onset, alongside daily preventive measures and trigger avoidance.',
    pathophysiology: 'Cortical spreading depression, activation of the trigeminovascular system, and release of vasoactive neuropeptides such as Calcitonin Gene-Related Peptide (CGRP) and Substance P.',
    commonSymptoms: [
      { name: 'Unilateral Pulsating / Throbbing Pain', description: 'Intense throbbing pain localized to one side of the head (though can be bilateral in 30%).', severity: 'common', category: 'Sensory' },
      { name: 'Photophobia & Phonophobia', description: 'Extreme sensitivity to bright lights, glare, loud noises, and even strong odors.', severity: 'common', category: 'Sensory' },
      { name: 'Nausea & Vomiting', description: 'Gastric stasis accompanied by severe Queasiness or active vomiting during the headache peak.', severity: 'common', category: 'Gastrointestinal' },
      { name: 'Visual Aura (in ~25% of sufferers)', description: 'Seeing flashing lights, zigzag lines (scintillating scotoma), blind spots, or geometric shapes 20–60 min before headache.', severity: 'moderate', category: 'Neurological' },
      { name: 'Pain Aggravated by Routine Activity', description: 'Walking, climbing stairs, or bending over exacerbates the throbbing intensity.', severity: 'common', category: 'Functional' },
      { name: 'Postdrome "Hangover" Phase', description: 'Exhaustion, neck stiffness, moodiness, and difficulty concentrating for 24-48 hours after pain subsides.', severity: 'moderate', category: 'Recovery' }
    ],
    whenToSeeDoctor: [
      {
        urgency: 'routine',
        title: 'Headache Frequency & Diary Review',
        description: 'See a physician if you experience headaches more than 4 days per month to discuss migraine preventive medications.'
      },
      {
        urgency: 'prompt',
        title: 'Medication Overuse Headaches ("Rebound")',
        description: 'Consult a specialist if you take pain relievers (paracetamol, ibuprofen, triptans) on > 10–15 days a month, as overuse causes worsening rebound daily headaches.'
      },
      {
        urgency: 'emergency',
        title: 'SNOOP Red-Flag Warning Signs',
        description: 'Seek immediate emergency evaluation for: "Thunderclap" sudden onset, headache with high fever and neck stiffness (meningitis), new neurological deficit (weakness, numbness), or new headache after age 50.'
      }
    ],
    emergencyTriggers: [
      'Sudden explosive "thunderclap" headache reaching maximum intensity in seconds.',
      'Headache accompanied by stiff neck, confusion, high fever, or petechial rash.',
      'Headache with persistent unilateral motor weakness, speech difficulty, or visual loss.'
    ],
    lifestyleAndSelfCare: [
      'Maintain a consistent sleep schedule: go to bed and wake up at the same time every day, including weekends.',
      'Do not skip meals; drink at least 2–2.5 liters of water daily to prevent dehydration triggers.',
      'Identify personal migraine triggers via a headache diary: aged cheese, artificial sweeteners, nitrates in cured meats, MSG, alcohol (red wine), or sudden caffeine withdrawal.',
      'Rest in a quiet, dark, well-ventilated room with an ice pack placed over the forehead or back of neck during an acute attack.'
    ],
    pharmacistGuidance: [
      'Take abortive medications (e.g. Sumatriptan, or combined Paracetamol + Caffeine + NSAID) AT THE VERY FIRST SIGN of migraine headache for maximum efficacy.',
      'Triptans should NOT be used by patients with uncontrolled hypertension, history of stroke, or coronary artery disease due to vasoconstrictive properties.',
      'Avoid taking simple analgesics or triptans more than 2-3 days per week to prevent Medication Overuse Headache (MOH).',
      'Preventive therapy (Beta-blockers, Amitriptyline, Topiramate, or CGRP antagonists) requires daily compliance for 2–3 months to evaluate true benefit.'
    ],
    commonMedicationClasses: [
      { name: 'Triptans (5-HT1B/1D Agonists)', purpose: 'Acute migraine abortive therapy; constricts cranial vessels and blocks CGRP', example: 'Sumatriptan, Zolmitriptan, Rizatriptan' },
      { name: 'Combination Analgesics', purpose: 'First-line relief for mild-to-moderate attacks', example: 'Paracetamol + Acetylsalicylic Acid + Caffeine' },
      { name: 'CGRP Receptor Antagonists (Gepants & mAbs)', purpose: 'Modern targeted migraine abortive and preventive therapy', example: 'Rimegepant, Erenumab (Aimovig)' },
      { name: 'Preventive Beta-Blockers & Anticonvulsants', purpose: 'Daily prevention to reduce attack frequency', example: 'Propranolol, Topiramate, Amitriptyline' }
    ],
    sourceCitations: [
      {
        organization: 'International Headache Society (IHS)',
        title: 'The International Classification of Headache Disorders 3rd edition (ICHD-3)',
        year: '2023',
        url: 'https://ichd-3.org/'
      },
      {
        organization: 'American Headache Society (AHS)',
        title: 'Consensus Statement on the Management of Migraine in Clinical Practice',
        year: '2024'
      },
      {
        organization: 'World Health Organization (WHO)',
        title: 'Headache Disorders Fact Sheet',
        year: '2023'
      }
    ]
  }
];

export const QUICK_SYMPTOM_TAGS = [
  'Excessive Thirst',
  'Frequent Urination',
  'Chest Pressure',
  'Shortness of Breath',
  'Wheezing',
  'Morning Headaches',
  'Swollen Feet & Ankles',
  'Joint Pain & Stiffness',
  'Heartburn & Acid Reflux',
  'Chronic Cough',
  'Dry Skin & Hair Loss',
  'Light Sensitivity & Aura',
  'Extreme Fatigue',
  'Unexplained Weight Loss'
];
