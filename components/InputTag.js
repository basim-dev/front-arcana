import { useState, useEffect, useRef } from "react";
import { Tag, X, Plus, AlertCircle } from "lucide-react";

const InputTag = ({
  value = [],
  onChange,
  name,
  placeholder = "Ajouter un tag...",
  maxTags = 10,
  suggestions = [],
  showTagIcon = true,
}) => {
  const [tags, setTags] = useState(value || []);
  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Synchronize with external value changes
  useEffect(() => {
    if (JSON.stringify(value) !== JSON.stringify(tags)) {
      setTags(value || []);
    }
  }, [value]);

  // Update filtered suggestions based on input
  useEffect(() => {
    if (inputValue.trim() && suggestions.length > 0) {
      const filtered = suggestions
        .filter(
          (suggestion) =>
            suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
            !tags.includes(suggestion)
        )
        .slice(0, 5); // Limit to 5 suggestions

      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setActiveSuggestion(-1);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, tags]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Emit change to parent component
  const emitChange = (updatedTags) => {
    onChange({
      target: {
        name,
        value: updatedTags,
      },
    });
  };

  const validateTagInput = (text) => {
    const trimmedText = text.trim().replace(/,/g, "");

    // Basic validation
    if (!trimmedText) {
      return { valid: false, message: "Tag ne peut pas être vide" };
    }

    if (trimmedText.length < 2) {
      return {
        valid: false,
        message: "Tag doit contenir au moins 2 caractères",
      };
    }

    if (trimmedText.length > 20) {
      return {
        valid: false,
        message: "Tag ne doit pas dépasser 20 caractères",
      };
    }

    if (tags.includes(trimmedText)) {
      return { valid: false, message: "Ce tag existe déjà" };
    }

    return { valid: true };
  };

  const handleKeyDown = (e) => {
    // Navigate suggestions with arrow keys
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : 0));
        return;
      }

      if (e.key === "Enter" && activeSuggestion >= 0) {
        e.preventDefault();
        addTag(filteredSuggestions[activeSuggestion]);
        return;
      }
    }

    // Add tag on Enter or comma
    if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }

    // Remove last tag on Backspace if input is empty
    if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      const newTags = [...tags];
      newTags.pop();
      setTags(newTags);
      emitChange(newTags);
    }

    // Close suggestions on Escape
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const addTag = (text) => {
    const trimmedText = text.trim().replace(/,/g, "");

    // Validate input
    if (tags.length >= maxTags) {
      setError(`Nombre maximum de tags atteint (${maxTags})`);
      return;
    }

    const validation = validateTagInput(trimmedText);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    // Add new tag
    const newTags = [...tags, trimmedText];
    setTags(newTags);
    emitChange(newTags);
    setInputValue("");
    setError("");
    setShowSuggestions(false);
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(newTags);
    emitChange(newTags);
    setError("");
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="tag-input-container">
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={`min-h-[48px] flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 transition-all duration-200 ${
          isInputFocused
            ? "border-arcanaBlue bg-white/5"
            : "border-white/10 bg-white/5"
        } ${error ? "border-red-500/70" : ""}`}
      >
        {tags.map((tag, index) => (
          <div
            key={index}
            className="bg-gray-800 text-gray-400 rounded px-3 py-1 text-sm inline-flex items-center cursor-default hover:bg-gray-700 transition-colors duration-200"
          >
            {showTagIcon && <Tag className="mr-1.5 w-[12px] h-[12px]" />}
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              aria-label={`Supprimer le tag ${tag}`}
              className="ml-1.5 text-gray-500 hover:text-gray-300 transition-colors duration-200"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <div className="flex-grow flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsInputFocused(true);
              if (inputValue && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              setIsInputFocused(false);
              // Delay hiding suggestions to allow clicking on them
              setTimeout(() => {
                if (inputValue.trim() && !error) {
                  addTag(inputValue);
                }
              }, 200);
            }}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-grow bg-transparent outline-none border-none text-white placeholder-gray-400 py-1 px-2 min-w-[120px]"
            disabled={tags.length >= maxTags}
            maxLength={25}
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => addTag(inputValue)}
              aria-label="Ajouter ce tag"
              className="text-arcanaBlue hover:text-arcanaBlue/80 transition-colors duration-200"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 mt-1 w-full left-0 bg-arcanaBackgroundDarker border border-white/10 rounded-lg shadow-lg py-1 max-h-64 overflow-auto"
            style={{
              top: "100%",
              marginTop: "4px",
            }}
          >
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`px-3 py-2 flex items-center cursor-pointer hover:bg-gray-800 transition-colors ${
                  index === activeSuggestion ? "bg-gray-800" : ""
                }`}
                onClick={() => addTag(suggestion)}
                onMouseEnter={() => setActiveSuggestion(index)}
              >
                {showTagIcon && (
                  <Tag className="mr-1.5 w-3 h-3 text-gray-400" />
                )}
                <span className="text-gray-300">{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1 mt-1 text-red-400 text-xs">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {/* Tag count indicator */}
      {tags.length > 0 && (
        <div
          className={`flex items-center justify-end mt-1 text-xs ${
            tags.length >= maxTags ? "text-amber-400" : "text-gray-400"
          }`}
        >
          <span>
            {tags.length}/{maxTags} tags
          </span>
        </div>
      )}
    </div>
  );
};

export default InputTag;
