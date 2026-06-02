const defaultConfig = {
  page_title: "Urlaub in Teilzeit Rechner",
  calculate_button: "Berechnen",
  reset_button: "Zurücksetzen",
  primary_color: "#006e80",
  secondary_color: "#008496"
};

// SDK / Config
async function onConfigChange(config) {
  const pageTitle = config.page_title || defaultConfig.page_title;
  const calculateButton = config.calculate_button || defaultConfig.calculate_button;
  const resetButton = config.reset_button || defaultConfig.reset_button;
  const primaryColor = config.primary_color || defaultConfig.primary_color;
  const secondaryColor = config.secondary_color || defaultConfig.secondary_color;

  document.getElementById('page-title').textContent = pageTitle;
  document.getElementById('page-title-heading').textContent = pageTitle;
  document.getElementById('calculate-btn').textContent = calculateButton;
  document.getElementById('reset-btn').textContent = resetButton;

  const radioInputs = document.querySelectorAll('input[type="radio"]');
  radioInputs.forEach(input => { input.style.accentColor = primaryColor; });

  const calculateBtn = document.querySelector('.btn-calculate');
  calculateBtn.style.background = primaryColor;

  const hoverStyle = document.getElementById('hover-style') || document.createElement('style');
  hoverStyle.id = 'hover-style';
  hoverStyle.textContent = `.btn-calculate:hover { background: ${secondaryColor} !important; }`;
  if (!document.getElementById('hover-style')) document.head.appendChild(hoverStyle);

  const resultSection = document.querySelector('.result-section');
  resultSection.style.background = primaryColor;
}

function mapToCapabilities(config) {
  return {
    recolorables: [
      { get: () => config.primary_color || defaultConfig.primary_color, set: value => window.elementSdk.setConfig({ primary_color: value }) },
      { get: () => config.secondary_color || defaultConfig.secondary_color, set: value => window.elementSdk.setConfig({ secondary_color: value }) }
    ],
    borderables: [],
    fontEditable: undefined,
    fontSizeable: undefined
  };
}

function mapToEditPanelValues(config) {
  return new Map([
    ["page_title", config.page_title || defaultConfig.page_title],
    ["calculate_button", config.calculate_button || defaultConfig.calculate_button],
    ["reset_button", config.reset_button || defaultConfig.reset_button]
  ]);
}

if (window.elementSdk) {
  window.elementSdk.init({ defaultConfig, onConfigChange, mapToCapabilities, mapToEditPanelValues });
}

// Berechnen
document.getElementById('calculate-btn').addEventListener('click', function (e) {
  e.preventDefault();

  const vollzeitUrlaub = parseInt(document.getElementById('vollzeit-urlaub').value, 10);
  const vollzeitWoche = parseInt(document.querySelector('input[name="vollzeit-woche"]:checked').value, 10);
  const teilzeitTage = parseInt(document.getElementById('teilzeit-tage').value, 10);

  const errorMessage = document.getElementById('error-message');
  errorMessage.classList.remove('show');
  errorMessage.textContent = '';

  // Validierung
  if (!vollzeitUrlaub || vollzeitUrlaub < 1) {
    errorMessage.textContent = 'Bitte geben Sie einen gültigen Urlaubsanspruch bei Vollzeit ein.';
    errorMessage.classList.add('show');
    return;
  }
  if (!teilzeitTage) {
    errorMessage.textContent = 'Bitte wählen Sie die Anzahl der Wochen-Arbeitstage bei Teilzeit.';
    errorMessage.classList.add('show');
    return;
  }

  // Berechnung: Urlaubsanspruch Vollzeit * (Teilzeit-Tage / Vollzeit-Woche)
  const teilzeitUrlaub = Math.round((vollzeitUrlaub * teilzeitTage) / vollzeitWoche);

  // Ergebnis anzeigen
  document.getElementById('teilzeit-urlaub').textContent = `${teilzeitUrlaub} Tage`;

  // Info-Box
  const infoBox = document.getElementById('info-box');
  infoBox.textContent = `Berechnung: ${vollzeitUrlaub} Urlaubstage × (${teilzeitTage} Teilzeittage ÷ ${vollzeitWoche} Vollzeittage) = ${teilzeitUrlaub} Urlaubstage.`;

  // Mindesturlaub-Warnung prüfen
  const warningBox = document.getElementById('warning-box');
  const minUrlaub = vollzeitWoche === 5 ? 20 : 24;
  const minUnterschritten = vollzeitUrlaub < minUrlaub;

  if (minUnterschritten) {
    warningBox.style.display = 'block';
    warningBox.textContent = `⚠ Der gesetzliche Mindesturlaubsanspruch wird nicht eingehalten. Sehr wahrscheinlich steht Ihnen mehr Urlaub zu.`;
  } else {
    warningBox.style.display = 'none';
    warningBox.textContent = '';
  }

  const results = document.getElementById('results');
  results.classList.add('show');
});

// Zurücksetzen
document.getElementById('reset-btn').addEventListener('click', function (e) {
  e.preventDefault();
  document.getElementById('vollzeit-urlaub').value = '';
  document.getElementById('woche-5').checked = true;
  document.getElementById('teilzeit-tage').value = '';
  document.getElementById('results').classList.remove('show');
  document.getElementById('error-message').classList.remove('show');
  document.getElementById('error-message').textContent = '';
  document.getElementById('warning-box').style.display = 'none';
});
