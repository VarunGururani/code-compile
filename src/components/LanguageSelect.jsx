import { LANGUAGE_LIST } from '../languages';

function LanguageSelect({ value, onChange, disabled }) {
  return (
    <label className="language-select">
      <span className="label">Language</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {LANGUAGE_LIST.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSelect;
