// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useEffect, useReducer } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import styles from "./Form.module.css";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useUrlParams } from "../hooks/useUrlParams";
import { CITY_DATA_URL } from "../utils/constants";
import Spinner from "./Spinner";
import Message from "./Message";
import { useCities } from "../contexts/CityContext";

function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

const initialState = {
  cityName: "",
  country: "",
  emoji: "",
  date: new Date(),
  notes: "",
  isFetchingData: false,
  geocodingError: "",
};

function reducer(currState, action) {
  switch (action.type) {
    case "fetching":
      return { ...currState, isFetchingData: true, geocodingError: "" };
    case "fetched":
      return {
        ...currState,
        isFetchingData: false,
        cityName: action.cityName,
        country: action.country,
        date: action.date,
        emoji: convertToEmoji(action.countryCode),
      };
    case "error":
      return {
        ...currState,
        isFetchingData: false,
        geocodingError: action.payload,
      };
    case "setValue": {
      const newObj = JSON.parse(JSON.stringify(currState));
      newObj[action.valueName] = action.value;
      return newObj;
    }
    case "setNewCity": {
      return { ...currState };
    }
    default:
      return currState;
  }
}

function Form() {
  const navigate = useNavigate();

  const [lat, lng] = useUrlParams();

  const { isLoading, setCity } = useCities();

  const [
    { cityName, country, emoji, notes, date, isFetchingData, geocodingError },
    dispatch,
  ] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchCityData() {
      try {
        dispatch({ type: "fetching" });
        const res = await fetch(
          `${CITY_DATA_URL}?latitude=${lat}&longitude=${lng}`
        );
        const data = await res.json();

        if (!data.countryCode)
          dispatch({
            type: "error",
            payload:
              "There doesn't seem to be a city where you clicked. Try again!",
          });

        dispatch({
          type: "fetched",
          cityName: data.city || data.locality || "",
          country: data.countryName,
          date: new Date(Date.now()),
          countryCode: data.countryCode,
        });
      } catch (error) {
        console.log(error);
        dispatch({ type: "error", payload: error.message });
      }
    }
    fetchCityData();
  }, [lat, lng]);

  if (isFetchingData || isLoading) return <Spinner />;

  if (geocodingError) return <Message message={geocodingError} />;

  return (
    <form
      className={styles.form}
      onSubmit={async (e) => {
        e.preventDefault();
        const obj = {
          cityName,
          country,
          emoji,
          date,
          notes,
          position: {
            lat,
            lng,
          },
        };
        const retVal = await setCity(obj);
        if (retVal) dispatch({ type: "error", payload: retVal });
        else navigate("/app");
      }}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) =>
            dispatch({
              type: "setValue",
              valueName: "cityName",
              value: e.target.value,
            })
          }
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          id="date"
          selected={date}
          dateFormat="dd/MM/yyyy"
          onChange={(d) =>
            dispatch({
              type: "setValue",
              valueName: "date",
              value: d,
            })
          }
          value={date}
        />
        {/* <input
          id="date"
          onChange={(e) =>
            dispatch({
              type: "setValue",
              valueName: "date",
              value: e.target.value,
            })
          }
          value={date}
        /> */}
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) =>
            dispatch({
              type: "setValue",
              valueName: "notes",
              value: e.target.value,
            })
          }
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <Button
          type="back"
          onClick={(e) => {
            e.preventDefault();
            navigate(-1);
          }}
        >
          Back
        </Button>
      </div>
    </form>
  );
}

export default Form;
