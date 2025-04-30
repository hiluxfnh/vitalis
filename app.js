document.addEventListener('DOMContentLoaded', async () => {
    let currentStep = 1;
    const totalSteps = 3;
    let translations = {};
    let userData = {};

    // DOM Elements
    const healthForm = document.getElementById('healthForm');
    const resultCard = document.getElementById('resultCard');
    const riskFill = document.getElementById('riskFill');
    const riskPercentage = document.getElementById('riskPercentage');
    const riskDescription = document.getElementById('riskDescription');
    const feedingRecommendations = document.getElementById('feedingRecommendations');
    const lifespanEstimate = document.getElementById('lifespanEstimate');
    const languageSelect = document.getElementById('languageSelect');

    // Load translations with error handling
    async function loadTranslations() {
        try {
            const response = await fetch('translations.json');
            if (!response.ok) throw new Error('Failed to load translations');
            translations = await response.json();
        } catch (error) {
            console.error('Translation error:', error);
            alert('Translation service unavailable. Using default language.');
        }
    }

    // Language management
    async function changeLanguage() {
        try {
            const lang = languageSelect.value;
            document.documentElement.lang = lang;
            
            if (!translations[lang]) {
                await loadTranslations();
            }

            // Update all text elements
            document.querySelectorAll('[data-translate]').forEach(element => {
                const key = element.getAttribute('data-translate');
                if (translations[lang]?.[key]) {
                    element.textContent = translations[lang][key];
                }
            });

            // Update select options
            updateSelectOptions(lang);

            // Force RTL reflow
            handleRTL(lang);

        } catch (error) {
            console.error('Language change failed:', error);
        }
    }

    function handleRTL(lang) {
        if (lang === 'ar') {
            document.body.style.direction = 'rtl';
            document.body.style.textAlign = 'right';
        } else {
            document.body.style.direction = 'ltr';
            document.body.style.textAlign = 'left';
        }
    }

    function updateSelectOptions(lang) {
        document.querySelectorAll('select').forEach(select => {
            Array.from(select.options).forEach(option => {
                if (option.dataset.translate) {
                    const key = option.dataset.translate;
                    option.textContent = translations[lang]?.[key] || key;
                }
            });
        });
    }

    // Form navigation
    function nextStep() {
        if (currentStep >= totalSteps) return;
        
        if (validateStep(currentStep)) {
            animateStepTransition(currentStep, currentStep + 1);
            currentStep++;
            updateNavigation();
            scrollToForm();
        }
    }

    function previousStep() {
        if (currentStep <= 1) return;
        
        animateStepTransition(currentStep, currentStep - 1);
        currentStep--;
        updateNavigation();
    }

    function animateStepTransition(oldStep, newStep) {
        const oldElement = document.querySelector(`[data-step="${oldStep}"]`);
        const newElement = document.querySelector(`[data-step="${newStep}"]`);
        
        if (oldElement && newElement) {
            oldElement.style.opacity = '0';
            oldElement.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                oldElement.classList.remove('active');
                newElement.classList.add('active');
                newElement.style.opacity = '1';
                newElement.style.transform = 'translateY(0)';
            }, 300);
        }
    }

    function updateNavigation() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const submitBtn = document.querySelector('.submit-btn');

        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
        nextBtn.style.display = currentStep === totalSteps ? 'none' : 'block';
        submitBtn.style.display = currentStep === totalSteps ? 'block' : 'none';
    }

    function validateStep(step) {
        let isValid = true;
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        
        if (!stepElement) {
            console.error(`Step ${step} element not found`);
            return false;
        }

        stepElement.querySelectorAll('input, select').forEach(element => {
            if (!element.checkValidity()) {
                element.reportValidity();
                element.classList.add('input-error');
                element.addEventListener('input', () => element.classList.remove('input-error'), { once: true });
                isValid = false;
            }
        });

        return isValid;
    }

    // Form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        if (validateStep(currentStep)) {
            userData = getFormInputs();
            const risk = calculateHealthRisk(userData);
            const lifespan = calculateLifespanEstimate(userData);
            const recommendations = generateRecommendations(userData);
            
            updateRiskDisplay(risk);
            updateLifespanDisplay(lifespan);
            updateRecommendationsDisplay(recommendations);
            
            resultCard.style.display = 'block';
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }

    // Data collection
    function getFormInputs() {
        return {
            gender: document.getElementById('gender').value,
            age: parseInt(document.getElementById('age').value),
            weight: parseInt(document.getElementById('weight').value),
            nutrition: parseInt(document.getElementById('nutrition').value),
            alcohol: parseInt(document.getElementById('alcohol').value),
            exercise: parseInt(document.getElementById('exercise').value),
            profession: document.getElementById('profession').value,
            sleep: parseInt(document.getElementById('sleep').value),
            transport: document.getElementById('transport').value,
            environment: document.getElementById('environment').value,
            region: document.getElementById('region').value,
            email: document.getElementById('email').value
        };
    }

    // Health calculations
    function calculateHealthRisk(data) {
        let risk = (data.age * 0.3) + 
                 ((10 - data.nutrition) * 2.5) + 
                 (data.alcohol * 10) + 
                 ((3 - data.exercise) * 8) +
                 (data.environment === 'city' ? 15 : 5) + 
                 (data.transport === 'walk' ? -5 : 5);

        const bmi = data.weight / ((1.75) ** 2);
        if (bmi > 30) risk += 20;
        else if (bmi > 25) risk += 10;
        else if (bmi < 18.5) risk += 15;

        return Math.min(Math.max(risk, 5), 95);
    }

    function calculateLifespanEstimate(data) {
        let base = 80;
        base -= (data.age * 0.1);
        base += (data.exercise * 2);
        base -= (data.alcohol * 3);
        base += (data.nutrition * 0.5);
        base += (data.environment === 'countryside' ? 5 : -3);
        base += (data.sleep >= 7 ? 5 : -5);
        return Math.max(base, data.age + 10);
    }

    function generateRecommendations(data) {
        let recs = [];
        const lang = document.documentElement.lang;
        
        if (data.nutrition <= 4) {
            recs.push(`🚨 ${translations[lang]?.rec_nutrition1}`);
            recs.push(`🥩 ${translations[lang]?.rec_nutrition2}`);
        }
        if (data.exercise < 2) {
            recs.push(`🏃 ${translations[lang]?.rec_exercise}`);
        }
        if (data.environment === 'city') {
            recs.push(`🏙️ ${translations[lang]?.rec_pollution}`);
        }
        return recs;
    }

    // UI Updates
    function updateRiskDisplay(risk) {
        const lang = document.documentElement.lang;
        
        riskFill.style.width = `${risk}%`;
        riskPercentage.textContent = `${translations[lang]?.risk_label}: ${risk.toFixed(1)}%`;
        
        if (risk < 30) {
            riskDescription.textContent = translations[lang]?.low_risk;
            riskDescription.style.color = 'var(--success)';
        } else if (risk < 60) {
            riskDescription.textContent = translations[lang]?.moderate_risk;
            riskDescription.style.color = '#FFA500';
        } else {
            riskDescription.textContent = translations[lang]?.high_risk;
            riskDescription.style.color = 'var(--danger)';
        }
    }

    function updateLifespanDisplay(estimate) {
        const lang = document.documentElement.lang;
        lifespanEstimate.innerHTML = `
            <span class="highlight">${estimate.toFixed(1)} ${translations[lang]?.years}</span>
            <small>${translations[lang]?.lifespan_note}</small>
        `;
    }

    function updateRecommendationsDisplay(recommendations) {
        feedingRecommendations.innerHTML = `
            <ul>${recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
        `;
    }

    // PDF Generation
    window.generatePDF = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const lang = document.documentElement.lang;

        doc.setFontSize(18);
        doc.text(translations[lang]?.pdf_title || 'Health Report', 20, 20);
        doc.setFontSize(12);

        let y = 30;
        Object.entries(userData).forEach(([key, value]) => {
            const label = translations[lang]?.[key] || key;
            doc.text(`${label}: ${value}`, 20, y);
            y += 10;
        });

        doc.save('health-report.pdf');
    }

    // Event listeners
    function initEventListeners() {
        document.querySelector('.next-btn').addEventListener('click', nextStep);
        document.querySelector('.prev-btn').addEventListener('click', previousStep);
        languageSelect.addEventListener('change', changeLanguage);
        healthForm.addEventListener('submit', handleFormSubmit);
    }

    // Initialization
    async function initializeApp() {
        await loadTranslations();
        initEventListeners();
        changeLanguage();
        updateNavigation();
        resultCard.style.display = 'none';
    }

    // Start the application
    initializeApp().catch(error => {
        console.error('Application initialization failed:', error);
        alert('Failed to initialize application. Please check console for details.');
    });
});