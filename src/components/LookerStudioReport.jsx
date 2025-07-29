'use client';

const LookerStudioReport = () => {
  return (
    <div className="w-full h-[800px] rounded-lg overflow-hidden border">
      <iframe
        src="https://lookerstudio.google.com/embed/reporting/00aaf0db-df1e-4a17-9e8d-251a15a4d1cd/page/p_m63q9t54bd"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        title="DSATrek Analytics Report"
      />
    </div>
  );
};

export default LookerStudioReport;
