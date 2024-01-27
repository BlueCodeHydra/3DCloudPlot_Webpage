import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;

public class DataRead {
    public static void main(String[] args) {
        DataRead dataRead = new DataRead();
        dataRead.readCSVFile();
    }

    public void readCSVFile() {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(getClass().getResourceAsStream("/data.csv")));
            boolean endOfFile = false;
            int scale = 1;

            FileWriter fileWriter = new FileWriter("poolTest1.txt");
            BufferedWriter writer = new BufferedWriter(fileWriter);

            while (!endOfFile) {
                String dataString = reader.readLine();
                if (dataString == null) {
                    endOfFile = true;
                    break;
                }

                String[] dataValues = dataString.split(",");
                String xyzCoordinates = dataValues[0] + "," + dataValues[1] + "," + dataValues[2];
                System.out.println(xyzCoordinates);

                float x = (float) (Math.cos(Float.parseFloat(dataValues[1]) * (Math.PI / 200)) * scale * -1 * Float.parseFloat(dataValues[2]));
                float y = Float.parseFloat(dataValues[0]) * scale / 5;
                float z = (float) (Math.sin(Float.parseFloat(dataValues[1]) * (Math.PI / 200)) * scale * Float.parseFloat(dataValues[2]));

                // Append XYZ coordinates to the output.txt file
                writer.write(x + " " + y + " " + z + "\n");

                // Here, you can create the sphere or do whatever you want with the coordinates
            }

            writer.close();
            fileWriter.close();
            reader.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
