document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const healthForm = document.getElementById('healthForm');
    const resultCard = document.getElementById('resultCard');
    const riskFill = document.getElementById('riskFill');
    const riskPercentage = document.getElementById('riskPercentage');
    const riskDescription = document.getElementById('riskDescription');
    const feedingRecommendations = document.getElementById('feedingRecommendations');
    const lifespanEstimate = document.getElementById('lifespanEstimate');

    // Form Submission Handler
    healthForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get and validate inputs
        const inputs = getFormInputs();
        if (!inputs) return;

        // Calculate health metrics
        const risk = calculateHealthRisk(inputs);
        const lifespan = calculateLifespanEstimate(inputs);
        const recommendations = generateRecommendations(inputs);

        // Update UI
        updateRiskDisplay(risk);
        updateLifespanDisplay(lifespan);
        updateRecommendationsDisplay(recommendations);
        resultCard.style.display = 'block';
    });

    // Input Handling
    function getFormInputs() {
        try {
            return {
                age: parseInt(document.getElementById('age').value),
                nutrition: parseInt(document.getElementById('nutrition').value),
                diseases: parseInt(document.getElementById('diseases').value),
                lifestyle: parseInt(document.getElementById('lifestyle').value),
                weight: parseInt(document.getElementById('weight').value)
            };
        } catch (error) {
            console.error('Error parsing inputs:', error);
            return null;
        }
    }

    // Risk Calculation Algorithm
    function calculateHealthRisk({ age, nutrition, diseases, lifestyle, weight }) {
        // Base risk factors
        let risk = (age * 0.3) + 
                  ((10 - nutrition) * 2.5) + 
                  (diseases * 15) + 
                  ((2 - lifestyle) * 10);

        // Weight adjustment (BMI simulation)
        const healthyWeight = Math.max(50, (age * 0.4) + 50); // Simplified formula
        const weightDiff = Math.abs(weight - healthyWeight);
        risk += weightDiff * 0.3;

        return Math.min(Math.max(risk, 5), 95); // Clamp between 5-95%
    }

    // Lifespan Estimation
    function calculateLifespanEstimate({ age, nutrition, diseases, lifestyle }) {
        const baseLifespan = 80;
        const modifiers = {
            lifestyle: (2 - lifestyle) * 3,
            nutrition: (10 - nutrition) * 0.7,
            diseases: diseases * 4.2,
            ageFactor: age * 0.08
        };

        let estimate = baseLifespan - 
                      modifiers.lifestyle - 
                      modifiers.nutrition - 
                      modifiers.diseases - 
                      modifiers.ageFactor;

        return Math.max(estimate, age + 5); // Ensure realistic minimum
    }

    // Recommendation Engine
    function generateRecommendations({ nutrition, lifestyle, diseases, weight }) {
        let recommendations = [];

        // Nutrition recommendations
        if (nutrition <= 4) {
            recommendations.push(
                "🚨 Increase vegetable intake (5+ servings daily)",
                "🥩 Add lean protein sources (fish, chicken, legumes)",
                "🌾 Replace refined carbs with whole grains",
                "💧 Ensure adequate hydration (2-3L water daily)"
            );
        } else if (nutrition <= 7) {
            recommendations.push(
                "🥗 Maintain balanced diet with 3-5 vegetable servings",
                "🚫 Limit processed food intake",
                "🥛 Ensure adequate calcium intake",
                "⚖️ Monitor portion sizes"
            );
        }

        // Lifestyle recommendations
        if (lifestyle === 0) {
            recommendations.push(
                "🚭 Reduce alcohol and tobacco use",
                "🏃 Increase physical activity (30min/day minimum)",
                "😴 Ensure 7-9 hours of quality sleep"
            );
        } else if (lifestyle === 1) {
            recommendations.push(
                "🚶‍♂️ Aim for 10,000 daily steps",
                "🧘 Incorporate stress-reduction techniques",
                "🍷 Limit alcohol to 2-3 units/week"
            );
        }

        // Weight recommendations
        const bmi = weight / ((1.75) ** 2); // Simplified BMI calculation
        if (bmi > 25) {
            recommendations.push(
                "⚖️ Consult nutritionist for weight management plan",
                "🏋️‍♂️ Combine cardio with strength training"
            );
        } else if (bmi < 18.5) {
            recommendations.push(
                "🥑 Increase healthy calorie intake",
                "💪 Focus on muscle-building exercises"
            );
        }

        // Disease prevention
        if (diseases > 0) {
            recommendations.push(
                "🩺 Regular medical check-ups recommended",
                "📆 Maintain medication schedule strictly"
            );
        }

        return recommendations;
    }

    // UI Updates
    function updateRiskDisplay(risk) {
        riskFill.style.width = `${risk}%`;
        riskPercentage.textContent = `Predicted Health Risk: ${risk.toFixed(1)}%`;
        
        if (risk < 30) {
            riskDescription.textContent = "Low Risk: Maintain your healthy lifestyle!";
            riskDescription.style.color = 'var(--success)';
        } else if (risk < 60) {
            riskDescription.textContent = "Moderate Risk: Consider lifestyle improvements";
            riskDescription.style.color = '#FFA500';
        } else {
            riskDescription.textContent = "High Risk: Please consult a healthcare professional";
            riskDescription.style.color = 'var(--danger)';
        }
    }

    function updateLifespanDisplay(estimate) {
        lifespanEstimate.innerHTML = `
            <span class="highlight">${estimate.toFixed(1)} years</span>
            <small>Projected lifespan based on current factors</small>
        `;
    }

    function updateRecommendationsDisplay(recommendations) {
        feedingRecommendations.innerHTML = `
            <ul>
                ${recommendations.map(r => `<li>${r}</li>`).join('')}
            </ul>
        `;
    }

    // Initialization
    function init() {
        resultCard.style.display = 'none';
        // Add any additional initialization code
    }

    init();
});