import Select from "react-select";
import { FaStar, FaRegStar } from "react-icons/fa";

const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#1f1f23",
    borderColor: state.isFocused ? "#70D6FF" : "rgba(255, 255, 255, 0.1)",
    boxShadow: state.isFocused ? "0 0 0 1px #70D6FF" : "none",
    "&:hover": {
      borderColor: "#70D6FF",
    },
    borderRadius: "0.5rem",
    padding: "2px 4px",
    color: "white",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9ca3af",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#1f1f23",
    borderRadius: "0.5rem",
    marginTop: 4,
    zIndex: 20,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor:
      state.data.value === null
        ? "#111827"
        : state.isSelected
        ? "#2563eb"
        : state.isFocused
        ? "#3b82f6"
        : "#1f1f23",
    color:
      state.data.value === null
        ? "#9ca3af"
        : state.isSelected || state.isFocused
        ? "white"
        : "#e5e7eb",
    "&:active": {
      backgroundColor: "#1d4ed8",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "white",
  }),
  input: (base) => ({
    ...base,
    color: "white",
  }),
};

const FilterBar = ({ handleFilterChange }) => {
  const starOptions = [
    {
      value: null,
      label: "Tout",
    },
    {
      value: 0,
      label: (
        <div style={{ display: "flex" }} className="text-yellow-500">
          <FaRegStar />
          <FaRegStar />
          <FaRegStar />
          <FaRegStar />
          <FaRegStar />
        </div>
      ),
    },
    {
      value: 1,
      label: (
        <div style={{ display: "flex" }} className="text-yellow-500">
          <FaStar />
          <FaRegStar />
          <FaRegStar />
          <FaRegStar />
          <FaRegStar />
        </div>
      ),
    },
    {
      value: 2,
      label: (
        <div style={{ display: "flex" }} className="text-yellow-500">
          <FaStar />
          <FaStar />
          <FaRegStar />
          <FaRegStar />
          <FaRegStar />
        </div>
      ),
    },
    {
      value: 3,
      label: (
        <div style={{ display: "flex" }} className="text-yellow-500">
          <FaStar />
          <FaStar />
          <FaStar />
          <FaRegStar />
          <FaRegStar />
        </div>
      ),
    },
    {
      value: 4,
      label: (
        <div style={{ display: "flex" }} className="text-yellow-500">
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
          <FaRegStar />
        </div>
      ),
    },
    {
      value: 5,
      label: (
        <div style={{ display: "flex" }} className="text-yellow-500">
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-ful mb-6 text-sm">
      {/* Filtre Status */}
      <Select
        name="status"
        options={[
          { value: null, label: "Tout" },
          { value: "completed", label: "Terminé" },
          { value: "in-progress", label: "En cours" },
          { value: "planned", label: "A découvrir" },
        ]}
        onChange={handleFilterChange}
        placeholder="Statut"
        styles={customStyles}
        className="w-full md:w-40 font-roboto"
      />

      {/* Filtre Type */}
      <Select
        name="type"
        options={[
          { value: null, label: "Tout" },
          { value: "movie", label: "Film" },
          { value: "serie", label: "Série" },
          { value: "book", label: "Livre" },
          { value: "music", label: "Musique" },
          { value: "game", label: "Jeux vidéos" },
        ]}
        onChange={handleFilterChange}
        placeholder="Type"
        styles={customStyles}
        className="w-full md:w-40 font-roboto"
      />

      {/* Filtre Rating */}
      <Select
        name="rating"
        options={starOptions}
        onChange={handleFilterChange}
        placeholder="Note"
        styles={customStyles}
        className="w-full md:w-40 font-roboto"
      />
    </div>
  );
};

export default FilterBar;
