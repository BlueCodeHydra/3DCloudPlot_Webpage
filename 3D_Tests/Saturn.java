import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Saturn {

    static class Coordinate {
        double x, y, z;

        Coordinate(double x, double y, double z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        @Override
        public String toString() {
            return x + " " + y + " " + z;
        }
    }

    public static void main(String[] args) {
        int planetPoints = 500; // Number of points to represent the planet
        int ringPoints = 1000; // Number of points to represent the ring

        List<Coordinate> saturnCoordinates = new ArrayList<>();
        saturnCoordinates.addAll(generateSphereCoordinates(planetPoints, 1.0)); // radius of the planet
        saturnCoordinates.addAll(generateTorusCoordinates(ringPoints, 1.5, 0.1)); // outer radius and tube radius of the ring

        writeCoordinatesToFile(saturnCoordinates, "txt/saturn.txt");
    }

    private static List<Coordinate> generateSphereCoordinates(int points, double radius) {
        List<Coordinate> coordinates = new ArrayList<>();

        for (int i = 0; i < points; i++) {
            double theta = Math.random() * 2 * Math.PI;
            double phi = Math.random() * Math.PI;
            double x = radius * Math.sin(phi) * Math.cos(theta);
            double y = radius * Math.sin(phi) * Math.sin(theta);
            double z = radius * Math.cos(phi);
            coordinates.add(new Coordinate(x, y, z));
        }

        return coordinates;
    }

    private static List<Coordinate> generateTorusCoordinates(int points, double outerRadius, double tubeRadius) {
        List<Coordinate> coordinates = new ArrayList<>();

        for (int i = 0; i < points; i++) {
            double theta = Math.random() * 2 * Math.PI;
            double phi = Math.random() * 2 * Math.PI;
            double x = (outerRadius + tubeRadius * Math.cos(theta)) * Math.cos(phi);
            double y = (outerRadius + tubeRadius * Math.cos(theta)) * Math.sin(phi);
            double z = tubeRadius * Math.sin(theta);
            coordinates.add(new Coordinate(x, y, z));
        }

        return coordinates;
    }

    private static void writeCoordinatesToFile(List<Coordinate> coordinates, String filename) {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filename))) {
            for (Coordinate coord : coordinates) {
                writer.write(coord.toString());
                writer.newLine();
            }
        } catch (IOException e) {
            System.err.println("Error writing to file: " + e.getMessage());
        }
    }
}
