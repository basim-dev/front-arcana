import { PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const COLORS = [
  "#70D6FF", // arcanaBlue
  "#A459D1", // arcanaPurple
  "#A2B0B8", // arcanaBackgroundBlue
  "#FF77A9", // Rose pastel
  "#FFD700", // Jaune doré
];

const PieStats = ({ data }) => {
  // Fonction de traduction des types
  const translateType = (type) => {
    const translations = {
      game: "Jeux vidéo",
      movie: "Film",
      serie: "Série",
      book: "Livre",
      music: "Musique",
    };
    return translations[type] || type; // Si pas de traduction, renvoyer le type d'origine
  };

  // Fonction de formatage du tooltip
  const tooltipFormatter = (value, name, props) => {
    return `${value}%`; // Affiche le type traduit et la valeur en pourcentage
  };

  return (
    <div className="w-full flex justify-center items-center mr-3">
      <PieChart
        width={500}
        height={350}
        margin={{ top: 0, right: 25, bottom: 0, left: 0 }}
      >
        <Pie
          data={data}
          dataKey="percentage"
          nameKey="type"
          cx="50%"
          cy="50%"
          outerRadius={95}
          fill="#8884d8"
          label={({ type, percentage }) =>
            `${translateType(type)} (${percentage}%)`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={tooltipFormatter} />
      </PieChart>
    </div>
  );
};

export default PieStats;
