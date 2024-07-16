import PropTypes from "prop-types";
import styles from "./CityItem.module.css";
import { Link } from "react-router-dom";
import { useCities } from "../contexts/CityContext";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

function CityItem({ city }) {
  const { currentCityId, deleteCity } = useCities();
  const { cityName, emoji, date, id, position } = city;

  const handleDeleteCity = async (e) => {
    e.preventDefault();
    const ret = await deleteCity(id);
    if (ret) alert(ret);
  };

  return (
    <li>
      <Link
        className={`${styles.cityItem} ${
          currentCityId === id && styles["cityItem--active"]
        }`}
        to={`${id}?lat=${position.lat}&lng=${position.lng}`}
      >
        <span className={styles.emoji}>{emoji}</span>
        <h2 className={styles.name}>{cityName}</h2>
        <time className={styles.date}>{formatDate(date)}</time>
        <button className={styles.deleteBtn} onClick={handleDeleteCity}>
          &times;
        </button>
      </Link>
    </li>
  );
}

CityItem.propTypes = {
  city: PropTypes.object.isRequired,
  currentCityId: PropTypes.string,
};

export default CityItem;
