package SPDownloader;

import javafx.application.Platform;
import javafx.scene.control.CheckBox;
import javafx.scene.control.SplitPane;
import javafx.scene.control.TextArea;

import javax.swing.*;
import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;

import static SPTools.Extractor.getFile;
import static SPTools.Extractor.getJarURI;

public class Downloader {

    protected static Thread t;

    protected static boolean isDownloading = false;

    protected static void downloader(CheckBox languageGerman, CheckBox languageEnglish, ArrayList<String> selectedEpisodes, TextArea console, SplitPane upperSplit) {
        int threadsInt = 1;

        //threadsInt = (int) threads.getSelectionModel().getSelectedItem();

        t = new Thread(new Runnable() {
            @Override
            public void run() {
                isDownloading = true;
                int languageInt = 0;

                if (languageGerman.isSelected()) {
                    languageInt = 1;
                } else if (languageEnglish.isSelected()) {
                    languageInt = 0;
                }
                for (String selectedEpisode : selectedEpisodes) {

                    String currEpisode = Arrays.asList(selectedEpisode.split(",")).get(0);
                    String currSeason = Arrays.asList(selectedEpisode.split(",")).get(1).replace("Season ", "");
                    String videoURL;
                    if (languageInt == 0) {
                        videoURL = "http://southpark.cc.com/full-episodes/s" + currSeason + "e" + currEpisode;
                        System.out.println(videoURL);
                    } else {
                        videoURL = "http://southpark.de/alle-episoden/s" + currSeason + "e" + currEpisode;
                        System.out.println(videoURL);
                    }


                    Path workingDirectory = Paths.get("").toAbsolutePath();
                    try {
                        final URI uriYTDL;
                        final URI exeYTDL;

                        uriYTDL = getJarURI();
                        exeYTDL = getFile(uriYTDL, "res/youtube-dl.exe");
                        Process process = new ProcessBuilder(new File(exeYTDL).getAbsolutePath(), videoURL, "--ignore-errors", "--retries", "10", "--output", "\"" + workingDirectory.toString() + "\\temp%(title)s.%(ext)s\"").start();
                        InputStream is = process.getInputStream();
                        InputStreamReader isr = new InputStreamReader(is);
                        BufferedReader br = new BufferedReader(isr);
                        String line;
                        String stdOut = null;
                        while ((line = br.readLine()) != null) {
                            final String test = line;
                            Platform.runLater(new Runnable() {
                                @Override
                                public void run() {
                                    console.appendText(test + "\n");
                                }
                            });
                            stdOut = stdOut + line + "\n";
                            if (line.toLowerCase().contains("[download] finished downloading playlist:")) {
                                String lastFileName = stdOut.substring(stdOut.indexOf("playlist") + 10, stdOut.length());

                                String[] result = lastFileName.split("\n", 2);

                                lastFileName = result[0];

                                System.out.println(result[0]);

                                Process process2 = null;
                                File[] dats = finder(new File(".").getCanonicalPath());
                                try {
                                    String arg = "\"SouthPark " + currSeason + "." + currEpisode + " - " + lastFileName + ".mkv\"";
                                    String arg2 = "";
                                    for (int i = 0; i < dats.length; i++) {
                                        if (dats.length - 1 == i) {
                                            arg2 = arg2 + '"' + dats[i] + '"';
                                        } else {
                                            arg2 = arg2 + '"' + dats[i] + '"';
                                            arg2 = arg2 + " + ";
                                        }
                                    }
                                    final URI uriMKVM;
                                    final URI exeMKVM;

                                    uriMKVM = getJarURI();
                                    exeMKVM = getFile(uriMKVM, "res/mkvmerge.exe");
                                    process2 = new ProcessBuilder(new File(exeMKVM).getAbsolutePath(), "-o", arg, arg2).start();


                                    System.err.println(arg);
                                } catch (IOException ex) {
                                    StringWriter errors = new StringWriter();
                                    ex.printStackTrace(new PrintWriter(errors));
                                    JOptionPane.showMessageDialog(null, "" + errors.toString());
                                }
                                InputStream is2 = process2.getInputStream();
                                InputStreamReader isr2 = new InputStreamReader(is2);
                                BufferedReader br2 = new BufferedReader(isr2);
                                String line2;

                                try {
                                    while ((line2 = br2.readLine()) != null) {
                                        System.out.println(line);
                                    }
                                } catch (IOException ex) {
                                    StringWriter errors = new StringWriter();
                                    ex.printStackTrace(new PrintWriter(errors));
                                    JOptionPane.showMessageDialog(null, "" + errors.toString());
                                }

                                for (File files : dats) {
                                    try {
                                        Files.delete(Paths.get(files.getAbsolutePath()));
                                    } catch (IOException ex) {
                                        StringWriter errors = new StringWriter();
                                        ex.printStackTrace(new PrintWriter(errors));
                                        JOptionPane.showMessageDialog(null, "" + errors.toString());
                                    }
                                }
                            }
                            System.out.println(line);
                        }
                    } catch (IOException ignored) {

                    } catch (URISyntaxException e) {
                        e.printStackTrace();
                    }

                }
                upperSplit.setDividerPositions(0.5);
                isDownloading = false;
            }
        });
        t.start();
    }

    private static File[] finder(String dirName) {
        File dir = new File(dirName);

        return dir.listFiles((dir1, filename) -> filename.endsWith(".mp4") && filename.startsWith("temp"));

    }
}
