import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import axios from "axios";

Chart.register(...registerables);

const backendUrl =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8005/api";

const BarChartComponent = ({ userId }) => {
  console.log("userId", userId);
  const chartRef = useRef(null);
  const [fetchedRatings, setFetchedRatings] = useState([]);
  const [averageRatings, setAverageRatings] = useState([]);

  useEffect(() => {
    const fetchRatings = async () => {
      console.log("fetching", userId);
      try {
        const response = await axios.get(
          `${backendUrl}/users/${userId}/rating`
        );
        console.log(response.data);
        setFetchedRatings(response.data);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchRatings();
  }, [userId]);

  useEffect(() => {
    const fetchAverageRatings = async () => {
      try {
        const response = await axios.get(`${backendUrl}/orders/rating`);
        setAverageRatings(response.data);
      } catch (error) {
        console.error("Error fetching average ratings:", error);
      }
    };

    fetchAverageRatings();
  }, []);

  useEffect(() => {
    if (fetchedRatings.length === 0 || averageRatings.length === 0) return;

    const productNames = fetchedRatings.map((item) => item.product);
    const productRatings = fetchedRatings.map((item) => item.rating);

    const averageRatingValues = averageRatings.map((item) => {
      const fetchedItem = fetchedRatings.find(
        (fetchedItem) => fetchedItem.product === item.product
      );
      return fetchedItem && fetchedItem.rating ? item.rating : null;
    });

    const barColors = fetchedRatings.map((item) => {
      const averageRating = averageRatings.find(
        (avg) => avg.product === item.product
      )?.rating; // Use optional chaining to handle undefined averageRating
      return item.rating <= averageRating
        ? "rgba(75, 192, 192, 0.2)"
        : "rgba(255, 99, 132, 0.2)";
    });

    const borderColors = fetchedRatings.map((item) => {
      const averageRating = averageRatings.find(
        (avg) => avg.product === item.product
      )?.rating; // Use optional chaining to handle undefined averageRating
      return item.rating <= averageRating
        ? "rgba(75, 192, 192, 1)"
        : "rgba(255, 99, 132, 1)";
    });

    const chart = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: productNames,
        datasets: [
          {
            label: "Product Ratings",
            data: productRatings,
            backgroundColor: barColors,
            borderColor: borderColors,
            borderWidth: 1,
          },
          {
            label: "Average Ratings",
            data: averageRatingValues,
            type: "line",
            fill: false,
            borderColor: "orange",
            tension: 1,
            borderWidth: 2, // Increase the borderWidth to make the line thicker
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
          },
        },
      },
    });

    return () => chart.destroy(); // Cleanup on unmount
  }, [fetchedRatings, averageRatings]);

  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default BarChartComponent;
