const API_KEY = 'AIzaSyCMGEC19-fxAnz1ImOCqzTYE3qIunR48Kc';
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

        const fearInput = document.getElementById('fearInput');
        const searchBtn = document.getElementById('searchBtn');
        const loading = document.getElementById('loading');
        const results = document.getElementById('results');
        const errorDiv = document.getElementById('error');
        const exampleSpans = document.querySelectorAll('.examples span');

        // Example clicks
        exampleSpans.forEach(span => {
            span.addEventListener('click', () => {
                fearInput.value = span.dataset.fear;
                analyzeFear();
            });
        });

        // Search button click
        searchBtn.addEventListener('click', analyzeFear);

        // Enter key press
        fearInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                analyzeFear();
            }
        });

        async function analyzeFear() {
            const fear = fearInput.value.trim();
            
            if (!fear) {
                showError('Please enter a fear or phobia to analyze.');
                return;
            }

            hideError();
            results.classList.remove('show');
            loading.classList.add('active');
            searchBtn.disabled = true;

            const prompt = `
Provide a detailed explanation about the fear of ${fear} in the following format:

Description: [Brief overview of the fear]

Scientific Name: [Medical term if applicable]

Common Symptoms:
- [Symptom 1]
- [Symptom 2]
- [Symptom 3]

Common Triggers:
- [Trigger 1]
- [Trigger 2]
- [Trigger 3]

Treatment Options:
- [Treatment 1]
- [Treatment 2]
- [Treatment 3]

Self-Help Tips:
- [Tip 1]
- [Tip 2]
- [Tip 3]

Did You Know?
- [Interesting historical fact about this phobia]
- [Surprising statistic or research finding]
- [Famous person who had/has this phobia]
- [Unique cultural perspective about this fear]

Please provide factual, well-structured information in this exact format.
            `;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error?.message || 'Failed to fetch data');
                }

                const explanation = data.candidates[0].content.parts[0].text;
                displayResults(fear, explanation);
            } catch (error) {
                showError(`Error: ${error.message}`);
                console.error('Full Error:', error);
            } finally {
                loading.classList.remove('active');
                searchBtn.disabled = false;
            }
        }

        function displayResults(fear, text) {
            const sections = parseResponse(text);
            
            let html = `
                <div class="result-card">
                    <h2 class="result-title">Fear of ${capitalizeFirst(fear)}</h2>
            `;

            // Description
            if (sections.description) {
                html += `
                    <div class="result-section">
                        <h3>Description</h3>
                        <p>${sections.description}</p>
                    </div>
                `;
            }

            // Scientific Name
            if (sections.scientificName) {
                html += `
                    <div class="result-section">
                        <h3>Scientific Name</h3>
                        <span class="scientific-name">${sections.scientificName}</span>
                    </div>
                `;
            }

            // Common Symptoms
            if (sections.symptoms && sections.symptoms.length > 0) {
                html += `
                    <div class="result-section">
                        <h3>Common Symptoms</h3>
                        <ul>
                            ${sections.symptoms.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Common Triggers
            if (sections.triggers && sections.triggers.length > 0) {
                html += `
                    <div class="result-section">
                        <h3>Common Triggers</h3>
                        <ul>
                            ${sections.triggers.map(t => `<li>${t}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Treatment Options
            if (sections.treatment && sections.treatment.length > 0) {
                html += `
                    <div class="result-section">
                        <h3>Treatment Options</h3>
                        <ul>
                            ${sections.treatment.map(t => `<li>${t}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Self-Help Tips
            if (sections.selfHelp && sections.selfHelp.length > 0) {
                html += `
                    <div class="result-section">
                        <h3>Self-Help Tips</h3>
                        <ul>
                            ${sections.selfHelp.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Did You Know?
            if (sections.funFacts && sections.funFacts.length > 0) {
                html += `
                    <div class="fun-facts">
                        <h3>Did You Know?</h3>
                        <ul>
                            ${sections.funFacts.map(fact => `<li>${fact}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            html += `</div>`;

            results.innerHTML = html;
            results.classList.add('show');
        }

        function parseResponse(text) {
            const sections = {
                description: '',
                scientificName: '',
                symptoms: [],
                triggers: [],
                treatment: [],
                selfHelp: [],
                funFacts: []
            };

            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            let currentSection = '';

            for (let line of lines) {
                if (line.startsWith('Description:')) {
                    sections.description = line.replace('Description:', '').trim();
                    currentSection = '';
                } else if (line.startsWith('Scientific Name:')) {
                    sections.scientificName = line.replace('Scientific Name:', '').trim();
                    currentSection = '';
                } else if (line.includes('Common Symptoms:')) {
                    currentSection = 'symptoms';
                } else if (line.includes('Common Triggers:')) {
                    currentSection = 'triggers';
                } else if (line.includes('Treatment Options:')) {
                    currentSection = 'treatment';
                } else if (line.includes('Self-Help Tips:')) {
                    currentSection = 'selfHelp';
                } else if (line.includes('Did You Know?')) {
                    currentSection = 'funFacts';
                } else if (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./)) {
                    const cleanLine = line.replace(/^[-•\d.]\s*/, '').trim();
                    if (cleanLine && currentSection) {
                        sections[currentSection].push(cleanLine);
                    }
                } else if (currentSection === 'description' && line) {
                    sections.description += ' ' + line;
                }
            }

            return sections;
        }

        function capitalizeFirst(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        function showError(message) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }

        function hideError() {
            errorDiv.classList.remove('show');
        }

        // Focus on input on load
        fearInput.focus();