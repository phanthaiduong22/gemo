import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const BarChartComponent = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchedRatings = [
      { product: "Coffee", rating: 4.5 },
      { product: "Milk Tea", rating: 4.2 },
      { product: "Bagel", rating: 4.7 },
      { product: "Sandwich", rating: 4.0 },
    ];

    const averageRatings = [
      { product: "Coffee", rating: 3.5 },
      { product: "Milk Tea", rating: 2.2 },
      { product: "Bagel", rating: 4.8 },
      { product: "Sandwich", rating: 4.0 },
      { product: "Average", rating: 3.2 },
    ];

    const productNames = fetchedRatings.map((item) => item.product);
    const productRatings = fetchedRatings.map((item) => item.rating);
    const averageRatingValues = averageRatings.map((item) => item.rating);

    const barColors = fetchedRatings.map((item) => {
      const averageRating = averageRatings.find(
        (avg) => avg.product === item.product
      ).rating;
      return item.rating <= averageRating
        ? "rgba(75, 192, 192, 0.2)"
        : "rgba(255, 99, 132, 0.2)";
    });

    const borderColors = fetchedRatings.map((item) => {
      const averageRating = averageRatings.find(
        (avg) => avg.product === item.product
      ).rating;
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
            tension: 0.1,
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
  }, []);

  return (
    <div>
      <canvas ref={chartRef} />
    </div>
  );
};

export default BarChartComponent;
