import React from 'react';
import { useParams } from 'react-router-dom';

const SensorDetail = ({ sensorDetails }) => {
  const { sensorId } = useParams();
  const sensor = sensorDetails[sensorId];

  if (!sensor) {
    return <div>Sensor not found</div>;
  }

  return (
    <div className="sensor-detail-page">
      <h2>{sensor.title}</h2>
      <div className="sensor-info">
        <h3>Details</h3>
        <p>{sensor.description}</p>
        <div className="sensor-specs">
          <div className="spec-item">
            <h4>Range</h4>
            <p>{sensor.range}</p>
          </div>
          <div className="spec-item">
            <h4>Accuracy</h4>
            <p>{sensor.accuracy}</p>
          </div>
          <div className="spec-item">
            <h4>Update Rate</h4>
            <p>{sensor.updateRate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorDetail;