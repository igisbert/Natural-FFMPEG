import { useState } from "preact/hooks";
import style from "./Presets.module.css";
import { CircleX } from "lucide-preact";
import presets, { CATEGORIES } from "../utils/presets";

export default function Presets({
  showPresets,
  setShowPresets,
  onPresetSelect,
}) {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.VIDEO);

  const handleClose = () => {
    setShowPresets(false);
  };

  const handlePresetClick = (preset) => {
    let prompt = preset.description;
    if (preset.filter) {
      prompt += `( ${preset.filter})`;
    }
    onPresetSelect(prompt);
    setShowPresets(false);
  };

  const filteredPresets = presets.filter(
    (preset) => preset.category === activeCategory,
  );

  return (
    <div
      className={`${style.presetsContainer} ${showPresets ? style.open : ""}`}
    >
      <div className={style.modal}>
        <header className={style.header}>
          <div className={style.categories}>
            {Object.values(CATEGORIES).map((cat) => (
              <button
                key={cat}
                className={`${style.categoryTab} ${
                  activeCategory === cat ? style.activeTab : ""
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className={style.close} onClick={handleClose}>
            <CircleX size={28} />
          </button>
        </header>

        <div className={style.grid}>
          {filteredPresets.map((preset, index) => (
            <button
              key={index}
              className={style.presetCard}
              onClick={() => handlePresetClick(preset)}
              type="button"
            >
              <span className={style.presetTitle}>{preset.title}</span>
              <span className={style.presetDescription}>
                {preset.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
