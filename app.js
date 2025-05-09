// app.js — Final Working Version
document.addEventListener('DOMContentLoaded', async () => {
  // --- Application State ---
  let currentStep = 1;
  const totalSteps = 4;
  let translations = {};
  let userData = {};
  let analysisResults = {};

  // --- DOM Elements ---
  const healthForm = document.getElementById('healthForm');
  const resultCard = document.getElementById('resultCard');
  const riskFill = document.getElementById('riskFill');
  const riskPercentage = document.getElementById('riskPercentage');
  const riskDescription = document.getElementById('riskDescription');
  const languageSelect = document.getElementById('languageSelect');
  const lifespanEstimate = document.getElementById('lifespanEstimate');
  const cardiovascularScore = document.getElementById('cardiovascularScore');
  const cardiovascularRisks = document.getElementById('cardiovascularRisks');
  const metabolicAge = document.getElementById('metabolicAge');
  const calorieTarget = document.getElementById('calorieTarget');
  const mealPlanElement = document.getElementById('mealPlan');
  const nutritionTips = document.getElementById('nutritionTips');
  const recoveryMeter = document.getElementById('recoveryMeter');
  const recoveryTips = document.getElementById('recoveryTips');
  const weeklyExercise = document.getElementById('weeklyExercise');
  const exerciseTips = document.getElementById('exerciseTips');
  const lifespanFactors = document.getElementById('lifespanFactors');

  // Hide results initially
  resultCard.style.display = 'none';

  // --- Load Translations ---
  async function loadTranslations() {
    try {
      const res = await fetch('translations.json');
      translations = await res.json();
    } catch (e) {
      console.warn('Translations unavailable, defaulting to keys.', e);
    }
  }

  // --- Language Management ---
  function changeLanguage() {
    const lang = languageSelect.value;
    document.documentElement.lang = lang;
    
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.dataset.translate;
      el.textContent = translations[lang]?.[key] || el.textContent;
    });
    
    document.querySelectorAll('select').forEach(sel => {
      Array.from(sel.options).forEach(opt => {
        const key = opt.dataset.translate;
        if (key) opt.textContent = translations[lang]?.[key] || opt.textContent;
      });
    });
    
    document.body.style.direction = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.style.textAlign = lang === 'ar' ? 'right' : 'left';
  }

  // --- Multi-Step Form ---
  function initializeFormSteps() {
    document.querySelectorAll('.form-step').forEach((step, i) => {
      step.classList.toggle('active', i === 0);
      step.style.display = i === 0 ? 'block' : 'none';
      step.style.opacity = i === 0 ? '1' : '0';
      step.style.transform = i === 0 ? 'translateY(0)' : 'translateY(20px)';
    });
    updateNavigation();
    updateProgress();
  }

  function showStep(n) {
    currentStep = n;
    document.querySelectorAll('.form-step').forEach((el, i) => {
      if (i === n - 1) {
        el.style.display = 'block';
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 10);
      } else {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        setTimeout(() => { el.style.display = 'none'; }, 300);
      }
    });
    updateNavigation();
    updateProgress();
  }

  function updateNavigation() {
    document.querySelector('.prev-btn').style.display = currentStep > 1 ? 'inline-block' : 'none';
    document.querySelector('.next-btn').style.display = currentStep < totalSteps ? 'inline-block' : 'none';
    document.querySelector('.submit-btn').style.display = currentStep === totalSteps ? 'inline-block' : 'none';
  }

  function updateProgress() {
    document.querySelectorAll('.progress-indicator .step').forEach((el, i) => {
      el.classList.toggle('active', i < currentStep);
    });
  }

  function validateStep(step) {
    let isValid = true;
    const el = document.querySelector(`.form-step[data-step="${step}"]`);
    
    el.querySelectorAll('input, select').forEach(inp => {
      if (!inp.checkValidity()) {
        inp.reportValidity();
        inp.classList.add('invalid');
        isValid = false;
      } else {
        inp.classList.remove('invalid');
      }
    });
    
    return isValid;
  }

  // --- Data Collection ---
  function collectFormData() {
    return {
      gender: document.getElementById('gender').value,
      age: +document.getElementById('age').value,
      height: +document.getElementById('height').value,
      heightUnit: document.getElementById('height-unit').value,
      weight: +document.getElementById('weight').value,
      nutrition: +document.getElementById('nutrition').value,
      alcohol: +document.getElementById('alcohol').value,
      smoking: document.getElementById('smoking').value,
      exercise: +document.getElementById('exercise').value,
      exerciseType: Array.from(document.getElementById('exercise-type').selectedOptions).map(o => o.value) || [],
      stress: +document.getElementById('stress').value,
      sleep: +document.getElementById('sleep').value,
      diet: document.getElementById('diet').value,
      transport: document.getElementById('transport').value,
      environment: document.getElementById('environment').value,
      profession: document.getElementById('profession').value,
      region: document.getElementById('region').value,
      name: document.getElementById('name').value
    };
  }

  // --- Analysis Core ---
  function performAnalysis(data) {
    try {
      const bmi = calculateBMI(data);
      return {
        riskScore: calculateRiskScore(data, bmi),
        lifespan: calculateLifespan(data, bmi),
        bmi,
        nutrition: analyzeNutrition(data),
        exercise: analyzeExercise(data),
        sleep: analyzeSleep(data),
        stress: analyzeStress(data),
        environment: analyzeEnvironment(data),
        cardiovascularHealth: calculateCardiovascularHealth(data),
        metabolicAge: calculateMetabolicAge(data, data.age),
        recoveryScore: calculateRecoveryScore(data)
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return { error: true };
    }
  }

  // --- Enhanced Analysis Components ---
  function analyzeNutrition(data) {
    const s = data.nutrition;
    const { diet, age, exercise } = data;

    const mealComponents = {
      proteins: {
        omnivore: ['Grilled chicken', 'Baked salmon', 'Boiled eggs'],
        vegetarian: ['Tofu stir-fry', 'Lentil curry', 'Chickpea salad'],
        vegan: ['Tempeh bowls', 'Black bean burgers', 'Edamame salads'],
        other: ['Mixed protein sources']
      },
      carbs: ['Quinoa', 'Brown rice', 'Sweet potatoes', 'Whole wheat pasta'],
      veggies: ['Leafy greens', 'Cruciferous veggies', 'Colorful vegetables'],
      fats: ['Avocado', 'Nuts', 'Olive oil', 'Seeds']
    };

    const dailyMealPlan = {
      breakfast: `${randomChoice(mealComponents.proteins[diet])} with ${randomChoice(mealComponents.carbs)}`,
      lunch: `${randomChoice(mealComponents.proteins[diet])} with ${randomChoice(mealComponents.veggies)}`,
      dinner: `${randomChoice(mealComponents.proteins[diet])} and ${randomChoice(mealComponents.fats)}`,
      snacks: ['Fresh fruits', 'Yogurt', 'Mixed nuts']
    };

    const calories = Math.round(
      (age < 30 ? 2000 : 1800) * 
      (exercise >= 3 ? 1.2 : 1) *
      (diet === 'vegan' ? 0.95 : 1)
    );

    return { 
      score: s,
      status: s >= 7 ? 'good' : s >= 4 ? 'fair' : 'poor',
      tips: [
        `Focus on ${mealComponents.proteins[diet].join(', ')} for protein`,
        `Aim for ${calories} kcal/day`,
        s < 5 ? 'Consider vitamin supplements' : ''
      ].filter(Boolean),
      mealPlan: generateMealSchedule(dailyMealPlan),
      mealStructure: dailyMealPlan,
      hydrationTips: ['8 glasses water/day', 'Herbal teas', 'Limit sugary drinks'],
      supplementSuggestions: getSupplements(data.diet)
    };
  }

  function analyzeExercise(data) {
    const frequency = data.exercise;
    
    const exerciseBank = {
      cardio: ['Brisk walking', 'Cycling', 'Swimming', 'HIIT'],
      strength: ['Bodyweight exercises', 'Resistance bands', 'Weight training'],
      flexibility: ['Yoga', 'Pilates', 'Dynamic stretching']
    };

    const personalizedPlan = (data.exerciseType || []).reduce((plan, type) => {
      plan[type] = exerciseBank[type].slice(0, frequency + 1);
      return plan;
    }, {});

    const weeklyPlan = generateWeeklySchedule(data);

    return {
      frequency,
      status: frequency >= 3 ? 'excellent' : frequency >= 2 ? 'good' : frequency >= 1 ? 'fair' : 'poor',
      tips: getExerciseTips(frequency),
      weeklyPlan,
      intensityLevel: calculateIntensity(data),
      personalizedPlan,
      recoveryTips: getRecoveryTipsArray(data.exerciseType)
    };
  }

  function analyzeSleep(data) {
    const hours = data.sleep;
    return {
      hours,
      status: hours >= 7 ? 'good' : hours >= 6 ? 'fair' : 'poor',
      tips: hours >= 7
        ? ['Maintain consistent sleep schedule']
        : hours >= 6
          ? ['Limit screen time before bed']
          : ['Consider sleep environment improvements'],
      qualityFactors: [
        hours < 6 && 'Consider sleep study',
        data.stress > 5 && 'Practice relaxation techniques'
      ].filter(Boolean)
    };
  }

  function analyzeStress(data) {
    const level = data.stress;
    return {
      level,
      status: level <= 3 ? 'low' : level <= 6 ? 'moderate' : 'high',
      tips: level <= 3
        ? ['Maintain current stress management']
        : level <= 6
          ? ['Practice mindfulness exercises']
          : ['Consider professional support'],
      copingStrategies: [
        'Deep breathing exercises',
        'Time management techniques',
        'Social support networking'
      ]
    };
  }

  function analyzeEnvironment(data) {
    return {
      pollutionRisk: data.environment === 'city'
        ? data.transport === 'walk' ? 10 : 20
        : 5,
      tips: data.environment === 'city'
        ? ['Use air purifier', 'Monitor AQI regularly']
        : ['Test well water', 'Natural ventilation'],
      improvementStrategies: [
        'Indoor plants',
        'HEPA air filters',
        'Low-VOC cleaning products'
      ]
    };
  }

  // --- UI Updates ---
  function updateAllMetrics(results) {
    if (results.error) {
      riskDescription.textContent = 'Analysis failed. Please try again.';
      return;
    }

    updateRiskDisplay(results.riskScore);
    updateCardiovascularDisplay(results.cardiovascularHealth);
    updateMetabolicAgeDisplay(results.metabolicAge);
    updateNutritionDisplay(results.nutrition);
    updateRecoveryDisplay(results.recoveryScore, results.exercise.recoveryTips);
    updateExerciseDisplay(results.exercise);
    updateLifespanDisplay(results.lifespan, results);
  }

  function updateRiskDisplay(score) {
    const lang = document.documentElement.lang;
    riskFill.style.width = `${score}%`;
    riskPercentage.textContent = `${translations[lang]?.risk_label || 'Risk'}: ${score.toFixed(1)}%`;
    
    if (score < 30) {
      riskDescription.textContent = translations[lang]?.low_risk || 'Low risk';
      riskDescription.style.color = '#4CAF50';
    } else if (score < 60) {
      riskDescription.textContent = translations[lang]?.moderate_risk || 'Moderate risk';
      riskDescription.style.color = '#FFC107';
    } else {
      riskDescription.textContent = translations[lang]?.high_risk || 'High risk';
      riskDescription.style.color = '#F44336';
    }
  }

  function updateCardiovascularDisplay(data) {
    const lang = document.documentElement.lang;
    cardiovascularScore.innerHTML = `
      <div class="score">${data.score.toFixed(0)}</div>
      <div class="rating ${data.rating.toLowerCase()}">${data.rating}</div>
    `;
    cardiovascularRisks.innerHTML = `
      <strong>${translations[lang]?.cardiovascular_risks || 'Potential Risks'}:</strong>
      <ul>${(data.risks || []).map(r => `<li>${r}</li>`).join('')}</ul>
    `;
  }

  function updateMetabolicAgeDisplay(age) {
    metabolicAge.textContent = `${age.toFixed(1)} years`;
  }

  function updateNutritionDisplay(data) {
    calorieTarget.innerHTML = `
      <i class="fas fa-bullseye"></i>
      ${data.tips[1] || ''}
    `;
    
    mealPlanElement.innerHTML = `
      <div class="meal-structure">
        <h4>Daily Meal Plan</h4>
        <p>Breakfast: ${data.mealStructure.breakfast}</p>
        <p>Lunch: ${data.mealStructure.lunch}</p>
        <p>Dinner: ${data.mealStructure.dinner}</p>
        <p>Snacks: ${data.mealStructure.snacks.join(', ')}</p>
      </div>
      <div class="supplements">
        <h4>Suggested Supplements</h4>
        <ul>${(data.supplementSuggestions || []).map(s => `<li>${s}</li>`).join('')}</ul>
      </div>
    `;
    
    nutritionTips.innerHTML = `
      <h4>Nutrition Tips</h4>
      <ul>${data.tips.map(t => `<li>${t}</li>`).join('')}</ul>
      <div class="hydration">
        <h4>Hydration Guide</h4>
        <ul>${data.hydrationTips.map(h => `<li>${h}</li>`).join('')}</ul>
      </div>
    `;
  }

  function updateRecoveryDisplay(score, recoveryTips) {
    recoveryMeter.style.width = `${score}%`;
    recoveryTips.innerHTML = `
      <p>${getRecoveryTips(score)}</p>
      ${recoveryTips?.length > 0 ? 
        `<ul>${recoveryTips.map(t => `<li>${t}</li>`).join('')}</ul>` : 
        '<p>No specific recovery tips needed</p>'}
    `;
  }

  function updateExerciseDisplay(data) {
    weeklyExercise.innerHTML = `
      <h4>Weekly Schedule</h4>
      <ul>${(data.weeklyPlan || []).map(day => `
        <li>
          <strong>${day.day}:</strong>
          ${day.activity} (${day.duration} mins)
        </li>
      `).join('')}</ul>
    `;
    
    exerciseTips.innerHTML = `
      <h4>Personalized Exercises</h4>
      ${Object.entries(data.personalizedPlan || {}).map(([type, exercises]) => `
        <div class="exercise-type">
          <h5>${type.charAt(0).toUpperCase() + type.slice(1)}</h5>
          <ul>${(exercises || []).map(e => `<li>${e}</li>`).join('')}</ul>
        </div>
      `).join('')}
    `;
  }

  function updateLifespanDisplay(years, data) {
    const lang = document.documentElement.lang;
    lifespanEstimate.innerHTML = `
      <span class="years">${years.toFixed(1)}</span>
      <span class="unit">${translations[lang]?.years || 'years'}</span>
    `;

    const factors = [
      data.nutrition.score >= 7 ? '🌱 Good Nutrition' : null,
      data.exercise.frequency >= 3 ? '💪 Regular Exercise' : null,
      data.stress.level <= 5 ? '😌 Low Stress' : null,
      data.recoveryScore >= 75 ? '🛌 Good Recovery' : null,
      data.environment === 'countryside' ? '🌳 Clean Environment' : null
    ].filter(Boolean);

    lifespanFactors.innerHTML = `
      <h5>${translations[lang]?.lifestyle_factors || 'Key Factors'}:</h5>
      <div class="factor-grid">${factors.map(f => `<div class="factor">${f}</div>`).join('')}</div>
    `;
  }

  // --- PDF Generation ---
  window.generateComprehensivePDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const lang = document.documentElement.lang;
    const date = new Date().toLocaleDateString();
    
    // PDF Configuration
    const primaryColor = '#2A5C82';
    const secondaryColor = '#5DA9E9';
    const margin = 15;
    let yPosition = margin;
    
    // Add Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(18);
    doc.setTextColor(255);
    doc.text(translations[lang]?.health_report || 'HealthGuard AI Report', margin, 20);
    doc.setTextColor(0);
    
    // Add Personal Information Section
    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text(`${translations[lang]?.personal_info || 'Personal Information'}:`, margin, yPosition);
    yPosition += 7;
    
    const personalInfo = [
      `Name: ${userData.name || '_________________________'}`, // Added name field
      `Age: ${userData.age}`,
      `Gender: ${userData.gender}`,
      `BMI: ${analysisResults.bmi.toFixed(1)}`,
      `Region: ${userData.region}`
    ];
    
    personalInfo.forEach((info, i) => {
      doc.setTextColor(0);
      doc.text(info, margin + 5, yPosition + (i * 7));
    });
    
    // Add Report Date
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text(`Report Date: ${date}`, 160, yPosition);
    yPosition += personalInfo.length * 7 + 10;
    
    // Main Content Sections
    const sections = [
      {
        title: translations[lang]?.risk_assessment || 'Health Risk Assessment',
        content: [
          `${translations[lang]?.risk_label || 'Risk Score'}: ${analysisResults.riskScore.toFixed(1)}%`,
          `Level: ${riskDescription.textContent}`
        ],
        color: primaryColor
      },
      {
        title: translations[lang]?.cardiovascular_health || 'Cardiovascular Health',
        content: [
          `Score: ${analysisResults.cardiovascularHealth.score.toFixed(0)} (${analysisResults.cardiovascularHealth.rating})`,
          `Risks: ${analysisResults.cardiovascularHealth.risks.join(', ')}`
        ],
        color: secondaryColor
      },
      {
        title: translations[lang]?.longevity || 'Longevity Estimate',
        content: [
          `Projected Lifespan: ${analysisResults.lifespan.toFixed(1)} years`,
          `Key Factors: ${lifespanFactors.textContent}`
        ],
        color: '#2A9D8F'
      }
    ];
  
    // Draw Content Sections
    sections.forEach((section, index) => {
      // Section Header
      doc.setFillColor(section.color);
      doc.rect(margin, yPosition, 180, 8, 'F');
      doc.setTextColor(255);
      doc.setFontSize(12);
      doc.text(section.title, margin + 5, yPosition + 6);
      
      // Section Content
      doc.setTextColor(0);
      doc.setFontSize(10);
      section.content.forEach((line, i) => {
        doc.text(line, margin + 5, yPosition + 15 + (i * 7));
      });
      
      // Add border
      doc.setDrawColor(section.color);
      doc.rect(margin, yPosition, 180, 15 + (section.content.length * 7));
      
      yPosition += 25 + (section.content.length * 7);
      
      // Add page break if needed
      if(yPosition > 250 && index < sections.length - 1) {
        doc.addPage();
        yPosition = margin;
      }
    });
  
    // Nutrition Plan Table
    const nutritionData = analysisResults.nutrition.mealPlan.slice(0, 5).map(meal => [meal]);
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.text(`${translations[lang]?.nutrition_plan || 'Nutrition Plan'}:`, margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.autoTable({
      startY: yPosition,
      head: [['Recommended Meals']],
      body: nutritionData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      margin: { left: margin }
    });
    yPosition = doc.lastAutoTable.finalY + 10;
  
    // Signature Section
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, 80, yPosition);
    doc.text(`${translations[lang]?.signature || 'Signature'}:`, margin, yPosition + 10);
    doc.text(`${translations[lang]?.date || 'Date'}: ________________`, 100, yPosition + 10);
  
    // Add Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, 190, 287, null, null, 'right');
      doc.text('HealthGuard AI - Predictive Healthcare Analytics', margin, 287);
      doc.text('Not a medical diagnosis - Consult your physician', 105, 287, null, null, 'center');
    }
  
    doc.save(`HealthGuard-Report-${userData.name || date}.pdf`);
  };

  // --- Form Submission ---
  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const btn = document.querySelector('.submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    try {
      userData = collectFormData();
      analysisResults = performAnalysis(userData);
      
      if (analysisResults.error) throw new Error('Analysis failed');
      
      updateAllMetrics(analysisResults);
      resultCard.style.display = 'block';
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });

    } catch (error) {
      console.error('Submission error:', error);
      alert(translations[document.documentElement.lang]?.analysis_error || 'Analysis failed. Please try again.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = translations[document.documentElement.lang]?.analyze || 'Analyze';
    }
  }

  // --- Initialization ---
  async function initializeApp() {
    await loadTranslations();
    changeLanguage();
    initializeFormSteps();

    document.querySelector('.next-btn').addEventListener('click', () => {
      if (validateStep(currentStep)) showStep(currentStep + 1);
    });

    document.querySelector('.prev-btn').addEventListener('click', () => {
      showStep(currentStep - 1);
    });

    languageSelect.addEventListener('change', changeLanguage);
    healthForm.addEventListener('submit', handleFormSubmit);
  }

  initializeApp().catch(err => {
    console.error('App initialization failed:', err);
    alert('Application failed to initialize. Please check browser console.');
  });
});

// --- Core Health Calculations ---
function calculateBMI(data) {
  const heightMeters = data.heightUnit === 'cm' 
    ? data.height / 100 
    : data.height * 0.3048;
  if (heightMeters <= 0) return 25; // Fallback
  return data.weight / (heightMeters ** 2);
}

function calculateRiskScore(data, bmi) {
  let score = data.age * 0.3;
  score += (10 - data.nutrition) * 2;
  score += data.alcohol * 8;
  score += (3 - data.exercise) * 5;
  score += data.stress * 0.8;
  score += data.sleep < 6 ? 15 : data.sleep < 8 ? 5 : 0;
  
  score += data.sleep < 6 ? 10 : 0;
  score += data.stress > 7 ? 15 : 0;
  score += data.environment === 'city' ? 5 : 0;
  score += data.transport === 'car' ? 3 : 0;
  score += (data.profession || '').match(/desk|office/i) ? 5 : 0;

  if (bmi > 30) score += 20;
  else if (bmi > 25) score += 10;
  else if (bmi < 18.5) score += 15;

  return Math.min(Math.max(score, 5), 95);
}

function calculateLifespan(data, bmi) {
  let base = 79;
  base += (data.nutrition - 5) * 0.4;
  base += data.exercise * 0.6;
  base += data.sleep >= 7 ? 2.3 : 0;
  
  base += data.exerciseType.includes('cardio') ? 0.5 : 0;
  base += data.nutrition >= 7 ? 1.2 : 0;
  base -= (data.profession || '').match(/night shift/i) ? 0.7 : 0;

  if (bmi > 25) base -= (bmi - 25) * 0.3;
  base -= data.alcohol * 0.4;
  base -= data.stress * 0.2;
  base += data.transport === 'walk' ? 1.2 : 0;
  base -= data.environment === 'city' ? 1.8 : 0;
  base += data.diet === 'vegetarian' ? 1.2 : 0;
  base += data.diet === 'vegan' ? 1.5 : 0;
  
  const regionMultipliers = {
    asia: 1.1,
    europe: 0.9,
    america: 0.7,
    africa: 1.0
  };
  base *= regionMultipliers[data.region] || 1.0;

  if ((data.profession || '').match(/manual|labor|fitness/i)) base += 0.8;
  if ((data.profession || '').match(/desk|office/i)) base -= 0.5;

  return Math.min(Math.max(base, data.age + 5), 120);
}

function calculateCardiovascularHealth(data) {
  const factors = {
    exercise: data.exercise * 2.5,
    nutrition: data.nutrition * 1.8,
    stress: (10 - data.stress) * 1.2,
    sleep: Math.min(data.sleep, 8) * 1.2,
    bmi: (25 - Math.abs(25 - calculateBMI(data))) * 0.8,
    alcohol: (3 - data.alcohol) * 1.5,
    smoking: data.smoking === 'never' ? 10 : 0,
    activityVariety: (data.exerciseType || []).length * 2
  };

  const score = Object.values(factors).reduce((sum, val) => sum + val, 0);
  
  return {
    score,
    rating: score >= 80 ? 'Excellent' :
           score >= 60 ? 'Good' :
           score >= 40 ? 'Fair' : 'Poor',
    risks: [
      score < 60 && 'High blood pressure risk',
      score < 50 && 'Potential cholesterol issues',
      data.nutrition < 4 && 'Low diet quality',
      data.alcohol > 1 && 'Alcohol consumption',
      data.transport === 'car' && 'Sedentary commuting'
    ].filter(Boolean)
  };
}

function calculateMetabolicAge(data, chronologicalAge) {
  const biologicalAge = chronologicalAge - 
    (data.exercise * 0.8) -
    (data.nutrition * 0.6) + 
    (data.stress * 0.4) - 
    (Math.max(data.sleep - 7, 0) * 0.3);

  return Math.max(biologicalAge, chronologicalAge - 15);
}

function calculateRecoveryScore(data) {
  let score = 100;
  score -= data.stress * 4;
  score += (data.sleep - 6) * 5;
  score += data.exercise * 3;
  score -= data.alcohol * 6;
  score += (data.exerciseType || []).includes('flexibility') ? 5 : 0;
  score -= (data.exerciseType || []).includes('HIIT') ? 10 : 0;
  score += data.environment === 'countryside' ? 5 : 0;
  return Math.max(Math.min(score, 100), 0);
}

// --- Helper Functions ---
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getSupplements(diet) {
  const supplements = {
    vegan: ['B12', 'Iron', 'Omega-3'],
    vegetarian: ['B12', 'Zinc'],
    omnivore: ['Vitamin D'],
    other: ['Multivitamin']
  };
  return supplements[diet] || [];
}

function generateWeeklySchedule(data) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    activity: (data.exerciseType || ['general'])[Math.floor(Math.random() * (data.exerciseType?.length || 1))] || 'rest',
    duration: 30 + (data.exercise * 10)
  }));
}

function calculateIntensity(data) {
  return (data.exerciseType || []).length * data.exercise;
}

function getExerciseTips(frequency) {
  return frequency >= 3
    ? ['Excellent! Maintain consistency']
    : frequency >= 2
      ? ['Add one more session weekly']
      : frequency >= 1
        ? ['Start with 2 sessions/week']
        : ['Begin with short daily walks'];
}

function generateMealSchedule(dailyMealPlan) {
  return Object.entries(dailyMealPlan).map(([mealType, description]) => 
    `${mealType}: ${description}`
  );
}

function getRecoveryTips(score) {
  if (score >= 85) return 'Excellent recovery capacity! Maintain your current routine.';
  if (score >= 60) return 'Good recovery. Consider adding relaxation techniques.';
  return 'Focus on improving sleep quality and stress management.';
}

function getRecoveryTipsArray(exerciseTypes = []) {
  const tips = [];
  if (exerciseTypes.includes('HIIT')) tips.push('Allow 48h recovery after HIIT');
  if (exerciseTypes.includes('strength')) tips.push('Use foam rolling for muscle recovery');
  if (exerciseTypes.includes('cardio')) tips.push('Hydrate well after cardio sessions');
  return tips.length > 0 ? tips : ['General recovery: Stretch daily'];
}