// app.js — Complete Corrected Version
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
  
  // New Metrics Elements
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
      exerciseType: Array.from(document.getElementById('exercise-type').selectedOptions).map(o => o.value),
      stress: +document.getElementById('stress').value,
      sleep: +document.getElementById('sleep').value,
      diet: document.getElementById('diet').value,
      transport: document.getElementById('transport').value,
      environment: document.getElementById('environment').value,
      profession: document.getElementById('profession').value,
      region: document.getElementById('region').value
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

  // --- Analysis Components ---
  function analyzeNutrition(data) {
    const s = data.nutrition;
    const { diet, age, exercise } = data;

    const proteins = {
      omnivore: ['chicken', 'fish', 'eggs'],
      vegetarian: ['tofu', 'lentils', 'quinoa'],
      vegan: ['tempeh', 'chickpeas', 'spirulina'],
      other: ['mixed sources']
    }[diet];

    const calories = Math.round(
      (age < 30 ? 2000 : 1800) * 
      (exercise >= 3 ? 1.2 : 1) *
      (diet === 'vegan' ? 0.95 : 1)
    );

    const mealPlan = [];
    for (let i = 0; i < 7; i++) {
      mealPlan.push(
        `${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}: ` +
        `${proteins[Math.floor(Math.random() * proteins.length)]} ` +
        `with seasonal veggies (${calories} kcal)`
      );
    }

    return { 
      score: s,
      status: s >= 7 ? 'good' : s >= 4 ? 'fair' : 'poor',
      tips: [
        `Focus on ${proteins.join(', ')} for protein`,
        `Aim for ${calories} kcal/day`,
        s < 5 ? 'Consider vitamin supplements' : ''
      ].filter(Boolean),
      mealPlan
    };
  }

  function analyzeExercise(data) {
    const frequency = data.exercise;
    const tips = frequency >= 3
      ? ['Excellent! Keep it varied.']
      : frequency >= 2
        ? ['Almost there! Aim for 3x/week.']
        : frequency >= 1
          ? ['Start with light walks.']
          : ['Begin with short walks.'];

    const weeklyPlan = frequency >= 3
      ? ['Mon: Cardio', 'Wed: Strength', 'Fri: Yoga']
      : frequency >= 2
        ? ['Tue: Cardio', 'Thu: Strength']
        : frequency >= 1
          ? ['Daily: 15-min walk']
          : ['Daily: 10-min walk'];

    return {
      frequency,
      status: frequency >= 3 ? 'excellent' : frequency >= 2 ? 'good' : frequency >= 1 ? 'fair' : 'poor',
      tips,
      weeklyPlan
    };
  }

  function analyzeSleep(data) {
    const hours = data.sleep;
    return {
      hours,
      status: hours >= 7 ? 'good' : hours >= 6 ? 'fair' : 'poor',
      tips: hours >= 7
        ? ['Good sleep!']
        : hours >= 6
          ? ['Try for 7+ hours.']
          : ['Improve bedtime routine.']
    };
  }

  function analyzeStress(data) {
    const level = data.stress;
    return {
      level,
      status: level <= 3 ? 'low' : level <= 6 ? 'moderate' : 'high',
      tips: level <= 3
        ? ['Low stress!']
        : level <= 6
          ? ['Moderate stress.']
          : ['High stress—take breaks.']
    };
  }

  function analyzeEnvironment(data) {
    return {
      pollutionRisk: data.environment === 'city'
        ? data.transport === 'walk' ? 10 : 20
        : 5,
      tips: data.environment === 'city'
        ? ['Use air purifier', 'Avoid peak traffic']
        : ['Ventilate indoors', 'Test water quality']
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
    updateRecoveryDisplay(results.recoveryScore);
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
      <ul>${data.risks.map(r => `<li>${r}</li>`).join('')}</ul>
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
      <ul>${data.mealPlan.map(m => `<li>${m}</li>`).join('')}</ul>
    `;
    nutritionTips.innerHTML = data.tips.map(t => `<div class="tip">${t}</div>`).join('');
  }

  function updateRecoveryDisplay(score) {
    recoveryMeter.style.width = `${score}%`;
    recoveryTips.textContent = getRecoveryTips(score);
  }

  function updateExerciseDisplay(data) {
    weeklyExercise.innerHTML = `
      <ul>${data.weeklyPlan.map(e => `<li>${e}</li>`).join('')}</ul>
    `;
    exerciseTips.innerHTML = data.tips.map(t => `<div class="tip">${t}</div>`).join('');
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
      data.recoveryScore >= 75 ? '🛌 Good Recovery' : null
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

    doc.setFontSize(18);
    doc.text(translations[lang]?.health_report || 'Comprehensive Health Report', 20, 20);

    // Risk Summary
    doc.setFontSize(12);
    doc.text(`Health Risk Score: ${analysisResults.riskScore.toFixed(1)}%`, 20, 30);
    doc.text(`Risk Level: ${riskDescription.textContent}`, 20, 38);

    // Cardiovascular Health
    doc.setFontSize(14);
    doc.text('❤️ Cardiovascular Health', 20, 50);
    doc.text(`Score: ${analysisResults.cardiovascularHealth.score.toFixed(0)} (${analysisResults.cardiovascularHealth.rating})`, 25, 60);
    doc.text(`Risks: ${analysisResults.cardiovascularHealth.risks.join(', ')}`, 25, 68);

    // Longevity Estimate
    doc.setFontSize(14);
    doc.text('⏳ Longevity Estimate', 20, 80);
    doc.text(`Projected Lifespan: ${analysisResults.lifespan.toFixed(1)} years`, 25, 90);
    doc.text(`Key Factors: ${lifespanFactors.textContent}`, 25, 98);

    // Nutrition Plan
    doc.setFontSize(14);
    doc.text('🥗 Nutrition Plan', 20, 110);
    doc.text(`Daily Target: ${analysisResults.nutrition.tips[1]}`, 25, 120);
    doc.text('Sample Meal Plan:', 25, 128);
    analysisResults.nutrition.mealPlan.slice(0, 5).forEach((meal, i) => {
      doc.text(`- ${meal}`, 30, 136 + (i * 8));
    });

    doc.save('comprehensive-health-report.pdf');
  };

  window.generateQuickSummary = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Quick Health Summary', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Risk Score: ${analysisResults.riskScore.toFixed(1)}%`, 20, 30);
    doc.text(`Lifespan Estimate: ${analysisResults.lifespan.toFixed(1)} years`, 20, 40);
    doc.text(`Metabolic Age: ${analysisResults.metabolicAge.toFixed(1)}`, 20, 50);
    doc.text(`Recovery Capacity: ${analysisResults.recoveryScore}%`, 20, 60);
    
    doc.save('quick-health-summary.pdf');
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

// --- Core Health Calculation Functions ---
function calculateBMI(data) {
  const heightMeters = data.heightUnit === 'cm' 
    ? data.height / 100 
    : data.height * 0.3048;
  return data.weight / (heightMeters ** 2);
}

function calculateRiskScore(data, bmi) {
  let score = data.age * 0.3;
  score += (10 - data.nutrition) * 2;
  score += data.alcohol * 8;
  score += (3 - data.exercise) * 5;
  score += data.stress * 0.8;
  score += data.sleep < 6 ? 15 : data.sleep < 8 ? 5 : 0;
  
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
  
  // BMI impact
  if (bmi > 25) base -= (bmi - 25) * 0.3;
  
  // Lifestyle factors
  base -= data.alcohol * 0.4;
  base -= data.stress * 0.2;
  
  // Environmental factors
  base += data.transport === 'walk' ? 1.2 : 0;
  base -= data.environment === 'city' ? 1.8 : 0;
  
  // Dietary bonuses
  base += data.diet === 'vegetarian' ? 1.2 : 0;
  base += data.diet === 'vegan' ? 1.5 : 0;
  
  // Regional adjustments
  const regionMultipliers = {
    asia: 1.1,
    europe: 0.9,
    america: 0.7,
    africa: 1.0
  };
  base *= regionMultipliers[data.region] || 1.0;

  // Professional impact
  if (data.profession.match(/manual|labor|fitness/i)) base += 0.8;
  if (data.profession.match(/desk|office/i)) base -= 0.5;

  return Math.min(Math.max(base, data.age + 5), 120);
}

function calculateCardiovascularHealth(data) {
  const factors = {
    exercise: data.exercise * 2.5,
    nutrition: data.nutrition * 1.8,
    stress: (10 - data.stress) * 1.2,
    sleep: Math.min(data.sleep, 9) * 1.5,
    bmi: (25 - Math.abs(25 - calculateBMI(data))) * 0.8,
    alcohol: (3 - data.alcohol) * 1.5,
    smoking: data.smoking === 'never' ? 10 : 0
  };

  const score = Object.values(factors).reduce((sum, val) => sum + val, 0);
  
  return {
    score,
    rating: score >= 80 ? 'Excellent' :
           score >= 60 ? 'Good' :
           score >= 40 ? 'Fair' : 'Poor',
    risks: [
      score < 60 && 'High blood pressure risk',
      score < 50 && 'Potential cholesterol issues'
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
  return Math.max(Math.min(score, 100), 0);
}

// --- Helper Functions ---
function getRecoveryTips(score) {
  if (score >= 85) return 'Excellent recovery capacity! Maintain your current routine.';
  if (score >= 60) return 'Good recovery. Consider adding relaxation techniques.';
  return 'Focus on improving sleep quality and stress management.';
}