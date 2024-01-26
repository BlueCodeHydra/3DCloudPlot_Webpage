import java.io.FileWriter;
import java.io.IOException;

public class Sphere{

    public static void main(String[] args) {
        try {
            generateSpherePoints(2.0, 1000, "sphere_points.txt");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void generateSpherePoints(double diameter, int numPoints, String filename) throws IOException {
        FileWriter writer = new FileWriter(filename);

        for (int i = 0; i < numPoints; i++) {
            double u = Math.random();
            double v = Math.random();

            double theta = 2 * Math.PI * u;
            double phi = Math.acos(2 * v - 1);

            double x = diameter * Math.sin(phi) * Math.cos(theta);
            double y = diameter * Math.sin(phi) * Math.sin(theta);
            double z = diameter * Math.cos(phi);

            writer.write(String.format("%.6f %.6f %.6f\n", x, y, z));
        }

        writer.close();
    }
}
