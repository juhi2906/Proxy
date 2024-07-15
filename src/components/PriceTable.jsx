import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles.css";

const PriceTable = () => {
  const [numRequests, setNumRequests] = useState(0);
  const [responseSize, setResponseSize] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetchDataAndUpdateTable();
    const interval = setInterval(fetchDataAndUpdateTable, 5000); // Fetch data every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [numRequests, responseSize, frequency]);

  const fetchDataAndUpdateTable = async () => {
    const api_url = "http://localhost:4000/dummy-data"; // Adjust URL based on your API endpoint
    try {
      const response = await axios.get(api_url);
      const data = response.data;

      const updatedTableData = data.zones.map((item) => ({
        zone: item.zone,
        type: item.type,
        cost_per_gb: item.cost_per_gb || "-",
        cpm: item.cpm || "-",
        spend_limit: item.spend_limit || "-",
        current_usage: `${item.current_usage}`, // Update with actual current_usage from API
        totalCost: calculateTotalCost(item),
        totalMonthlyCost: calculateMonthlyTotalCost(item),
      }));

      setTableData(updatedTableData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const calculateTotalCost = (item) => {
    let totalCost = 0;
    if (item.cost_per_gb !== null && responseSize !== 0) {
      totalCost = (item.cost_per_gb * responseSize).toFixed(2);
    }
    return totalCost;
  };

  const calculateMonthlyTotalCost = (item) => {
    const dailyToMonthly = frequency; // Assuming frequency is number of days/month
    return calculateTotalCost(item) * dailyToMonthly;
  };

  const sortTable = () => {
    const sortedData = [...tableData];
    sortedData.sort((a, b) => a.totalCost - b.totalCost); // Sort by totalCost ascending
    setTableData(sortedData);
  };

  return (
    <div className="big-container">
      <h2>Cost Estimation</h2>
      <div className="form-container">
        <div className="form-group">
          <label htmlFor="numRequests">No. Of Requests:</label>
          <input
            type="number"
            id="numRequests"
            name="numRequests"
            className="input-box"
            value={numRequests}
            onChange={(e) => setNumRequests(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="responseSize">Response Size (GB):</label>
          <input
            type="number"
            id="responseSize"
            name="responseSize"
            className="input-box"
            value={responseSize}
            onChange={(e) => setResponseSize(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="frequency">Frequency (No. of days/month):</label>
          <input
            type="number"
            id="frequency"
            name="frequency"
            className="input-box"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          />
        </div>
      </div>
      <table id="priceTable">
        <thead>
          <tr>
            <th>Zone</th>
            <th>Type</th>
            <th>Cost/GB</th>
            <th>CPM</th>
            <th>Spend Limit</th>
            <th>Current Usage</th>
            <th className="total-row">
              Total
              <select
                id="sortTotalDropdown"
                className="sort-dropdown"
                onChange={sortTable}
              >
                <option value="">No Filter</option>
                <option value="lowToHigh">Low to High</option>
                <option value="highToLow">High to Low</option>
              </select>
            </th>
            <th className="monthlytotal-row">
              Monthly Total
              <select
                id="sortMonthlyTotalDropdown"
                className="sort-dropdown"
                onChange={sortTable}
              >
                <option value="">No Filter</option>
                <option value="lowToHigh">Low to High</option>
                <option value="highToLow">High to Low</option>
              </select>
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((item, index) => (
            <tr key={index}>
              <td>{item.zone}</td>
              <td>{item.type}</td>
              <td>${item.cost_per_gb}</td>
              <td>{item.cpm ? `$${item.cpm}` : "-"}</td>
              <td>{item.spend_limit}</td>
              <td className="current-usage">${item.current_usage}</td>
              <td>${item.totalCost}</td>
              <td>${item.totalMonthlyCost.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PriceTable;
