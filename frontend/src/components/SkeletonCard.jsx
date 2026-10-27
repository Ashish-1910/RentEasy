export default function SkeletonCard() {
  return (
    <div className="card h-100 shadow-sm skeleton-card">
      <div className="skel" style={{ height: 180 }} />
      <div className="card-body">
        <div className="skel skel-line w-50" />
        <div className="skel skel-line w-100 mt-3" />
        <div className="skel skel-line w-75" />
        <div className="skel skel-line w-50 mt-3" />
      </div>
    </div>
  );
}

