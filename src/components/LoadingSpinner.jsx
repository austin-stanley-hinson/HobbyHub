// A spinning basketball shown while data is being fetched
function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="loading" role="status">
      <div className="basketball" aria-hidden="true" />
      <p className="loading-label">{label}</p>
    </div>
  );
}

export default LoadingSpinner;
