package SPDownloader;

import SPEditor.Editor;
import SPTools.DB;
import javafx.beans.property.BooleanProperty;
import javafx.beans.property.SimpleBooleanProperty;
import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.cell.CheckBoxListCell;
import javafx.scene.layout.AnchorPane;
import javafx.util.Callback;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;

import static SPDownloader.Downloader.downloader;
import static SPDownloader.Downloader.t;
import static SPDownloader.Main.stage;

public class Controller {

    private ArrayList<String> selectedEpisodes = new ArrayList<>();

    @FXML
    private TabPane seasonTabs;

    @FXML
    private javafx.scene.control.ListView<String> selectedList;

    @FXML
    private TextArea console;

    @FXML
    private Button download;
    @FXML
    private Button stop;
    @FXML
    private Button databaseEditor;
    @FXML
    private Button selectAll;
    @FXML
    private Button deselectAll;

    @FXML
    private CheckBox languageEnglish;
    @FXML
    private CheckBox languageGerman;

    @FXML
    private ChoiceBox threads;

    @FXML
    private SplitPane upperSplit;
    @FXML
    private SplitPane split;

    @FXML
    private AnchorPane lower;

    @FXML
    public void initialize() throws SQLException {
        updatePanes(true);
    }

    public void updatePanes(boolean selectAll) throws SQLException {
        //clear all
        seasonTabs.getTabs().clear();
        selectedEpisodes.clear();
        selectedList.getItems().clear();
        //init variables
        DB db = new DB();
        ArrayList<String> s = db.getSeasonCount();

        for (int i = 0; i < s.size(); i++) {
            //add Tab
            final String season = s.get(i);
            Tab test = new Tab("Season " + season);
            //add ListView
            AnchorPane pane = new AnchorPane();
            javafx.scene.control.ListView<String> listView = new javafx.scene.control.ListView<>();
            listView.setMinHeight(seasonTabs.getMinHeight());
            listView.setMinWidth(seasonTabs.getMinWidth());
            listView.setItems(db.getEpisodesBySeason(s.get(i)));
            listView.getSelectionModel().setSelectionMode(SelectionMode.MULTIPLE);


            listView.setCellFactory(CheckBoxListCell.forListView(new Callback<String, ObservableValue<Boolean>>() {
                @Override
                public ObservableValue<Boolean> call(String item) {
                    BooleanProperty observable = new SimpleBooleanProperty();
                    if (selectAll) {
                        observable.setValue(true);
                    } else {
                        observable.setValue(false);
                    }
                    String temp = item + "," + "Season " + season;
                    if (!selectedEpisodes.contains(temp) && selectAll) {
                        selectedEpisodes.add(temp);
                    }
                    ObservableList list = FXCollections.observableArrayList(selectedEpisodes);
                    selectedList.setItems(list);
                    //observable.addListener((obs, wasSelected, isNowSelected) -> System.out.println("Check box for " + item + " changed from "+wasSelected+" to "+isNowSelected));
                    observable.addListener(new ChangeListener<Boolean>() {
                        @Override
                        public void changed(ObservableValue<? extends Boolean> observable, Boolean oldValue, Boolean newValue) {
                            if (selectedEpisodes.contains(item + "," + seasonTabs.getSelectionModel().getSelectedItem().getText())) {
                                selectedEpisodes.remove(item + "," + seasonTabs.getSelectionModel().getSelectedItem().getText());
                                System.out.println(item + "," + seasonTabs.getSelectionModel().getSelectedItem().getText() + " Already existed! removed it...");
                                ObservableList list = FXCollections.observableArrayList(selectedEpisodes);
                                selectedList.setItems(list);
                                for (int j = 0; j < selectedEpisodes.size(); j++) {
                                    System.out.println(selectedEpisodes.get(j));
                                }
                            } else {
                                selectedEpisodes.add(item + "," + seasonTabs.getSelectionModel().getSelectedItem().getText());
                                System.out.println(item + "," + seasonTabs.getSelectionModel().getSelectedItem().getText() + " not existed... added it");
                                ObservableList list = FXCollections.observableArrayList(selectedEpisodes);
                                selectedList.setItems(list);
                                for (int j = 0; j < selectedEpisodes.size(); j++) {
                                    System.out.println(selectedEpisodes.get(j));
                                }
                            }
                        }
                    });
                    return observable;
                }
            }));
            test.setContent(pane);
            pane.getChildren().add(listView);

            Button deselectButton = new Button();
            deselectButton.setLayoutX(250);
            deselectButton.setText("deselect all from\n Season " + season);
            deselectButton.setOnAction(new EventHandler<ActionEvent>() {
                @Override
                public void handle(ActionEvent event) {
                    listView.setCellFactory(CheckBoxListCell.forListView(new Callback<String, ObservableValue<Boolean>>() {
                        @Override
                        public ObservableValue<Boolean> call(String param) {
                            BooleanProperty observable = new SimpleBooleanProperty();
                            observable.setValue(false);
                            for (int j = 0; j < selectedEpisodes.size(); j++) {
                                if (selectedEpisodes.get(j).contains("Season " + season)) {
                                    System.out.println("removed " + selectedEpisodes.get(j));
                                    selectedEpisodes.remove(j);
                                }
                            }
                            ObservableList list = FXCollections.observableArrayList(selectedEpisodes);
                            selectedList.setItems(list);
                            return observable;
                        }
                    }));
                }
            });
            pane.getChildren().add(deselectButton);

            Button selectButton = new Button();
            selectButton.setLayoutX(250);
            selectButton.setLayoutY(50);
            selectButton.setText("select all from\n Season " + season);
            selectButton.setOnAction(new EventHandler<ActionEvent>() {
                @Override
                public void handle(ActionEvent event) {
                    listView.setCellFactory(CheckBoxListCell.forListView(new Callback<String, ObservableValue<Boolean>>() {
                        @Override
                        public ObservableValue<Boolean> call(String param) {
                            BooleanProperty observable = new SimpleBooleanProperty();
                            observable.setValue(true);
                            try {
                                ObservableList temp = db.getEpisodesBySeasonFormatted(season);
                                for (int j = 0; j < temp.size(); j++) {
                                    System.out.println(temp.get(j));
                                }
                                ObservableList list = FXCollections.observableArrayList(selectedEpisodes);
                                Collections.addAll(list, temp.toArray());
                                selectedList.setItems(list);
                            } catch (SQLException e) {
                                e.printStackTrace();
                            }
                            return observable;
                        }
                    }));
                }
            });
            pane.getChildren().add(selectButton);
            seasonTabs.getTabs().add(test);
        }
    }

    @FXML
    public void onGerman() {
        languageEnglish.setSelected(false);
    }

    @FXML
    public void onEnglish() {
        languageGerman.setSelected(false);
    }

    @FXML
    public void onDatabaseEditor() throws Exception {
        Editor editor = new Editor();
        editor.start(stage);
    }


    @FXML
    public void onDownload() {
        upperSplit.setDividerPositions(0.3);
        downloader(languageGerman, languageEnglish, selectedEpisodes, console, upperSplit);
    }

    @FXML
    public void onStop() {
        upperSplit.setDividerPositions(0.5);
        t.stop();
    }

    @FXML
    public void onSelectAll() throws SQLException {
        for (int i = 0; i < selectedEpisodes.size(); i++) {
            System.out.println(selectedEpisodes.get(i));
        }
        updatePanes(true);
    }

    @FXML
    public void onDeselectAll() throws SQLException {
        for (int i = 0; i < selectedEpisodes.size(); i++) {
            System.out.println(selectedEpisodes.get(i));
        }
        updatePanes(false);
    }

}
