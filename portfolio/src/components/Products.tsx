export default function Products() {
  return (
    <section aria-label="hero section">
      <div>
        <h2 className="text-3xl font-bold">Products</h2>
        <div>
          <h3 className="font-bold">Transport Robot Monitoring App</h3>
          <p>
            The Transport Robot Monitoring App is an application designed to monitor and manage the operation of transport robots used within hospitals in real-time. This app allows users to:

            Real-Time Tracking: Monitor the current location and movement of each transport robot on a dynamic map.
            Status Updates: Receive instant notifications about the operational status of the robots, including battery levels, maintenance needs, and task completion.
            Camera Integration: Integrate with hospital surveillance cameras to view live footage of the surroundings of each robot.
            Alert System: Set up custom alerts for specific conditions such as deviations from planned routes, low battery warnings, and errors.
            This app seamlessly integrates with the data regularly sent from the robots to the system, providing critical information for monitoring and addressing errors related to the transport robots.
          </p>
          <h3 className="font-bold">3D Model Display App for Automotive Painting</h3>
          <p>
            The 3D Model Display App for Automotive Painting is an application designed to visualize and manage 3D models at each stage of the painting process, from design to finishing. This app allows paint technicians to:

            3D Model Display: View the exterior of the vehicle in high resolution and check the details of the paint.
            Comparison of Robot Painting Paths: Overlay and easily compare different paths of the painting robots.
            Version Control: Manage different versions of paint patterns and track change histories.
            This app is a powerful tool to enhance the quality and efficiency of automotive painting, allowing for quick verification and adjustments.
          </p>
          <h3 className="font-bold">Test Vehicle Disposal Management Tool</h3>
          <p>
            The Test Vehicle Disposal Management Tool is an application designed to efficiently manage the disposal process of test vehicles used within the company. This tool enables administrators to:

            Vehicle Display: Retrieve and track test vehicle information from the existing database.
            Status Monitoring: Monitor the usage status and current location of each vehicle in real-time.
            Disposal Schedule Management: Set disposal dates for vehicles and send reminders to responsible personnel through notification features.
            This tool simplifies the management of the test vehicle disposal process and improves efficiency.
          </p>
        </div>
      </div>
    </section>
  );
}