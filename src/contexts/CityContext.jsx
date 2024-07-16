import { createContext, useContext, useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import { BASE_URL } from "../utils/constants";

const cityContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  currentCityId: "",
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };

    case "city/loaded":
      return {
        ...state,
        isLoading: false,
        currentCity: action.payload,
        currentCityId: action.payload.id,
      };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
        currentCityId: action.payload.id,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
        currentCityId:
          state.currentCityId === action.payload ? "" : state.currentCityId,
      };

    // Don't need anymore bcz of the feature: "current city not fetched again on double click"
    // case "city/unmounted":
    //   return {...state, currentCity: {}}

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error("Unknown action type");
  }
}

function CityProvider({ children }) {
  const [{ cities, isLoading, currentCity, currentCityId, error }, dispatch] =
    useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchCities() {
      dispatch({ type: "loading" });

      try {
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch (error) {
        console.log(error);
        dispatch({
          type: "rejected",
          payload: "There was an error loading cities...",
        });
      }
    }
    fetchCities();
  }, []);

  async function getCity(id) {
    if (String(id) === String(currentCity.id)) return;

    dispatch({ type: "loading" });
    try {
      const response = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await response.json();
      dispatch({ type: "city/loaded", payload: data });
    } catch (error) {
      console.error("Error fetching city", error);
      dispatch({
        type: "rejected",
        payload: "There was an error loading the city...",
      });
    }
  }

  async function setCity(data) {
    dispatch({ type: "loading" });

    try {
      const response = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const ret = await response.json();

      dispatch({ type: "city/created", payload: ret });
      return false;
    } catch (error) {
      console.error("Error creating city", error);
      return error.message || "Error creating new city!";
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      await fetch(`${BASE_URL}/cities/${id}`, { method: "DELETE" });

      dispatch({ type: "city/deleted", payload: id });

      return false;
    } catch (error) {
      console.log(error);
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the city...",
      });
      return (
        `Couldn't delete city: ${error.message}` ||
        "Couldn't delete city. Try later!"
      );
    }
  }

  return (
    <cityContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        error,
        getCity,
        setCity,
        deleteCity,
        currentCityId,
      }}
    >
      {children}
    </cityContext.Provider>
  );
}

CityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

function useCities() {
  const context = useContext(cityContext);

  if (!context) {
    throw new Error("useCity must be used within a CityProvider");
  }

  return context;
}

export { CityProvider, useCities };
