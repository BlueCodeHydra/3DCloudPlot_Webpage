
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class Dolphin {

    static class Coordinate {
        double x, y, z;

        Coordinate(double x, double y, double z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        @Override
        public String toString() {
            return (x + " " + y + " " + z );
        }
    }

    public static void main(String[] args) {
        List<Coordinate> dolphinCoordinates = generateDolphinCoordinates();
        writeCoordinatesToFile(dolphinCoordinates, "txt/dolphin.txt");
    }

    private static List<Coordinate> generateDolphinCoordinates() {
        List<Coordinate> coordinates = new ArrayList<>();

        int length = 10; // Length of the dolphin
        for (int i = 0; i < length; i++) {
            double x = i;
            double y = Math.sin(i * Math.PI / length) * 20; // Simple sine wave for the body shape
            double z = 0; // Dolphin shape in 2D plane (X and Y axis)
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
