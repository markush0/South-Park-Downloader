package SPEditor;

import SPDownloader.DB;
import SPDownloader.Main;
import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.ChoiceBox;

import java.sql.SQLException;

import static SPDownloader.Main.stage;

public class Controller {
    @FXML
    ChoiceBox addSeason;
    @FXML
    ChoiceBox addEpisodesFirst;
    @FXML
    ChoiceBox addEpisodesSecond;
    @FXML
    ChoiceBox deleteSeason;

    @FXML
    Button addButton;
    @FXML
    Button deleteButton;
    @FXML
    Button goBack;

    @FXML
    public void onAddButton() throws SQLException {
        DB db = new DB();
        db.addSeason(Integer.parseInt(addSeason.getSelectionModel().getSelectedItem().toString()), Integer.parseInt(addEpisodesFirst.getSelectionModel().getSelectedItem().toString()), Integer.parseInt(addEpisodesSecond.getSelectionModel().getSelectedItem().toString()));
    }

    @FXML
    public void onDeleteButton() throws SQLException {
        DB db = new DB();
        db.deleteSeason(Integer.parseInt(deleteSeason.getSelectionModel().getSelectedItem().toString()));
    }

    @FXML
    public void onGoBack() throws Exception {
        Main main = new Main();
        main.start(stage);
    }
}
