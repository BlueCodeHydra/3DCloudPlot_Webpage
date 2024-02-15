import java.io.PrintWriter;

public class Cave {

    public static void main(String[] args) {
        // Parameters for the tube
        int length = 30; // Length of the tube along the z-axis
        int radius = 5; // Radius of the tube

        // Output the tube coordinates to a text file
        outputToFile(generateTube(length, radius), "txt/cave.txt");
    }

    private static String generateTube(int length, int radius) {
        StringBuilder coordinates = new StringBuilder();

        for (int z = 0; z < length; z++) {
            // Loop over 360 degrees to generate the tube's perimeter points for each z level
            for (int angle = 0; angle < 360; angle++) {
                double radian = Math.toRadians(angle);
                // Calculate x and y using the center of the tube as the origin
                int x = (int) (radius * Math.cos(radian)) + radius; // Center the tube on the x-axis
                int y = (int) (radius * Math.sin(radian)) + radius; // Center the tube on the y-axis

                // Append the coordinate to the StringBuilder
                coordinates.append(x).append(" ").append(y).append(" ").append(z).append("\n");
            }
        }
        return coordinates.toString();
    }

    private static void outputToFile(String coordinates, String filename) {
        try (PrintWriter out = new PrintWriter(filename)) {
            out.print(coordinates);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
