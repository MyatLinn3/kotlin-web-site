import $ from 'jquery'
import NavTree from '../com/nav-tree/index'

$(document).ready(() => {
  new NavTree(document.querySelector('.js-side-tree-nav'));
});

function postProcessCodeBlocks() {
    var GRADLE_DSLs = ["groovy", "kotlin"];
    var preferredBuildScriptLanguage = initPreferredBuildScriptLanguage();

    // Ensure preferred DSL is valid, defaulting to Groovy DSL
    function initPreferredBuildScriptLanguage() {
        var lang = window.localStorage.getItem("preferred-gradle-dsl");
        if (GRADLE_DSLs.indexOf(lang) === -1) {
            window.localStorage.setItem("preferred-gradle-dsl", "groovy");
            lang = "groovy";
        }
        return lang;
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function processSampleEl(sampleEl, prefLangId) {
        if (sampleEl != null) {
            sampleEl.setAttribute("mode", sampleEl.getAttribute("mode"));
            if (sampleEl.getAttribute("mode") !== prefLangId) {
                sampleEl.classList.add("hidden");
            } else {
                sampleEl.classList.remove("hidden");
            }
            var nextSiblingEl = codeEl.nextElementSibling;
            if (nextSiblingEl.classList.contains("executable-fragment-wrapper")) {
                nextSiblingEl.setAttribute("mode", sampleEl.getAttribute("mode"));
                processSampleEl(nextSiblingEl, prefLangId);
            }
        }
    }

    function switchSampleLanguage(languageId) {
        var multiLanguageSampleElements = [].slice.call(document.querySelectorAll(".sample"));

        // Array of Arrays, each top-level array representing a single collection of samples
        var multiLanguageSets = [];
        for (var i = 0; i < multiLanguageSampleElements.length; i++) {
            var currentSampleElement = multiLanguageSampleElements[i];
            if (!currentSampleElement.parentNode.classList.contains("multi-language-sample")) {
                continue;
            }

            var currentCollection = [currentSampleElement];
            processSampleEl(currentSampleElement, languageId);
            while (currentSampleElement.nextElementSibling != null && currentSampleElement.nextElementSibling.classList.contains("sample")) {
                currentCollection.push(currentSampleElement.nextElementSibling);
                currentSampleElement = currentSampleElement.nextElementSibling;
                processSampleEl(currentSampleElement, languageId);
                i++;
            }

            multiLanguageSets.push(currentCollection);
        }

        multiLanguageSets.forEach(function (sampleCollection) {
            // Create selector element if not existing
            if (sampleCollection.length > 1 &&
                (sampleCollection[0].previousElementSibling == null ||
                    !sampleCollection[0].previousElementSibling.classList.contains("multi-language-selector"))) {
                var languageSelectorFragment = document.createDocumentFragment();
                var multiLanguageSelectorElement = document.createElement("div");
                multiLanguageSelectorElement.classList.add("multi-language-selector");
                languageSelectorFragment.appendChild(multiLanguageSelectorElement);


                sampleCollection.forEach(function (sampleEl) {
                    var optionEl = document.createElement("code");
                    var sampleLanguage = sampleEl.getAttribute("mode");
                    optionEl.setAttribute("mode", sampleLanguage);
                    optionEl.setAttribute("role", "button");
                    optionEl.classList.add("language-option");

                    optionEl.innerText = capitalizeFirstLetter(sampleLanguage);

                    optionEl.addEventListener("click", function updatePreferredLanguage(evt) {
                        var preferredLanguageId = optionEl.getAttribute("mode");
                        window.localStorage.setItem("preferred-gradle-dsl", preferredLanguageId);

                        // Record how far down the page the clicked element is before switching all samples
                        var beforeOffset = evt.target.offsetTop;

                        switchSampleLanguage(preferredLanguageId);

                        // Scroll the window to account for content height differences between different sample languages
                        window.scrollBy(0, evt.target.offsetTop - beforeOffset);
                    });
                    multiLanguageSelectorElement.appendChild(optionEl);
                });
                sampleCollection[0].parentNode.insertBefore(languageSelectorFragment, sampleCollection[0]);
            }
        });

        [].slice.call(document.querySelectorAll(".multi-language-selector .language-option")).forEach(function (optionEl) {
            if (optionEl.getAttribute("mode") === languageId) {
                optionEl.classList.add("selected");
            } else {
                optionEl.classList.remove("selected");
            }
        });

        [].slice.call(document.querySelectorAll(".multi-language-text")).forEach(function (el) {
            if (!el.classList.contains("lang-" + languageId)) {
                el.classList.add("hidden");
            } else {
                el.classList.remove("hidden");
            }
        });
    }

    switchSampleLanguage(preferredBuildScriptLanguage);
}

document.addEventListener("DOMContentLoaded", function(event) {
    postProcessCodeBlocks();
});