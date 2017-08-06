package SPTools;

import javafx.collections.FXCollections;
import javafx.collections.ObservableList;

import javax.swing.*;
import java.sql.*;
import java.util.ArrayList;

public class DB {

    Connection conn = null;

    private static Connection dbConnector() {
        try {
            Class.forName("org.sqlite.JDBC");
            return DriverManager.getConnection("jdbc:sqlite::resource:res/settings.sqlite");
        } catch (Exception e) {
            JOptionPane.showMessageDialog(null, e);
            return null;
        }
    }

    public ArrayList<String> getSeasonCount() throws SQLException {
        Connection conn = dbConnector();
        Statement statement = conn.createStatement();

        ResultSet res = statement.executeQuery("SELECT * from EPISODES");
        ArrayList<String> test = new ArrayList<>();
        while (res.next()) {
            if (test.size() == 0) {
                test.add(res.getString("SEASON"));
            } else {
                if (!test.contains(res.getString("SEASON"))) {
                    test.add(res.getString("SEASON"));
                }
            }
        }
        return test;
    }

    public ObservableList getEpisodesBySeason(String season) throws SQLException {
        Connection conn = dbConnector();
        Statement statement = conn.createStatement();
        ResultSet res = statement.executeQuery("SELECT EPISODE FROM EPISODES WHERE SEASON = '" + season + "'");
        ObservableList rt = FXCollections.observableArrayList();
        if (res != null) {
            while (res.next()) {
                rt.add(res.getString("EPISODE"));
            }
        }
        return rt;
    }

    public ObservableList getEpisodesBySeasonFormatted(String season) throws SQLException {
        Connection conn = dbConnector();
        Statement statement = conn.createStatement();

        ResultSet res = statement.executeQuery("SELECT EPISODE FROM EPISODES WHERE SEASON = '" + season + "'");
        ObservableList rt = FXCollections.observableArrayList();
        while (res.next()) {
            rt.add(res.getString("EPISODE") + ",Season " + season);
        }
        return rt;
    }

    public void addSeason(int season, int episodesFirst, int episodesSecond) throws SQLException {
        Connection connection = dbConnector();
        String ep;
        String se;
        if (season < 10) {
            se = "0" + season;
        } else {
            se = "" + season;
        }
        for (int i = episodesFirst; i < episodesSecond + 1; i++) {
            if (i < 10) {
                ep = "0" + i;
            } else {
                ep = "" + i;
            }
            String query = "INSERT INTO `EPISODES` ( `SEASON` , `EPISODE` ) VALUES ( '" + se + "', '" + ep + "' );";
            Statement statement = connection.createStatement();
            statement.executeUpdate(query);
        }
    }

    public void deleteSeason(int season) throws SQLException {
        Connection connection = dbConnector();
        String se;
        if (season < 10) {
            se = "0" + season;
        } else {
            se = "" + season;
        }
        Statement statement = connection.createStatement();
        String sql = "DELETE FROM EPISODES WHERE SEASON = '" + se + "'";
        statement.executeUpdate(sql);
    }

}
