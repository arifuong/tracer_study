package backend.service;

import backend.entity.Alumni;
import backend.entity.Laporan;
import backend.entity.User;
import backend.exception.BusinessException;
import backend.exception.ResourceNotFoundException;
import backend.repository.*;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

// Service Layer
// Tempat seluruh business logic aplikasi.
@Service
@RequiredArgsConstructor
public class ReportService {

    private final LaporanRepository laporanRepository;
    private final AlumniRepository alumniRepository;
    private final UserRepository userRepository;
    private final DashboardService dashboardService;
    private final PeriodeKuesionerRepository periodeKuesionerRepository;

    private static final String REPORT_DIR = "c:\\laragon\\www\\tracer_study\\backend\\reports";

    private void ensureReportDirectoryExists() {
        File dir = new File(REPORT_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    public List<Laporan> getLaporanList() {
        return laporanRepository.findAllByOrderByCreatedAtDesc();
    }

    // Helper to format percentage cleanly
    private String formatPercentage(Double percentage) {
        if (percentage == null) return "0%";
        double p = percentage;
        if (p == (long) p) {
            return String.format("%.0f%%", p);
        } else {
            return String.format("%.2f%%", p);
        }
    }

    // Export to PDF
    // Menghasilkan dokumen PDF berisi Laporan Tracer Study dengan standar akademik.
    @Transactional
    public byte[] exportPdf(String adminUsername, Long periodeId, String namaLaporanInput) {
        ensureReportDirectoryExists();
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin tidak ditemukan"));

        String namaLaporan = (namaLaporanInput == null || namaLaporanInput.trim().isEmpty()) 
                ? "Laporan_Tracer_Study_" + System.currentTimeMillis() 
                : namaLaporanInput.trim().replace(" ", "_");

        List<Alumni> alumniList = alumniRepository.findAll();
        var stats = dashboardService.getDashboardStats(periodeId);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        // Menggunakan margin yang rapi dan konsisten (0.75 inci = 54f)
        Document document = new Document(PageSize.A4, 54f, 54f, 54f, 54f);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Font styles (Menggunakan standar akademik)
            java.awt.Color primaryColor = new java.awt.Color(30, 59, 138); // Deep Navy #1E3B8A
            java.awt.Color titleColor = new java.awt.Color(2, 8, 23); // Dark Navy/Slate #020817
            java.awt.Color borderGray = new java.awt.Color(203, 213, 225); // Slate 300 #CBD5E1
            java.awt.Color lightBg = new java.awt.Color(248, 250, 252); // Alternating row color #F8FAFC
            java.awt.Color whiteColor = java.awt.Color.WHITE;

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Font.NORMAL, titleColor);
            Font campusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.NORMAL, primaryColor);
            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, new java.awt.Color(100, 116, 139));
            Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.NORMAL, primaryColor);
            Font subSectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.NORMAL, titleColor);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Font.NORMAL, titleColor);
            Font bodyBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.NORMAL, titleColor);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Font.NORMAL, whiteColor);

            // 1. HEADER SECTION (Centered)
            Paragraph campusName = new Paragraph("STMIK MARDIRA INDONESIA", campusFont);
            campusName.setAlignment(Element.ALIGN_CENTER);
            campusName.setSpacingAfter(4f);
            document.add(campusName);

            Paragraph reportTitle = new Paragraph("LAPORAN TRACER STUDY ALUMNI", titleFont);
            reportTitle.setAlignment(Element.ALIGN_CENTER);
            reportTitle.setSpacingAfter(6f);
            document.add(reportTitle);

            // Fetch and check period name
            String periodText = "";
            if (periodeId != null) {
                var pOpt = periodeKuesionerRepository.findById(periodeId);
                if (pOpt.isPresent()) {
                    periodText = "Periode: " + pOpt.get().getNamaPeriode() + "  |  ";
                }
            }
            
            String printDateText = "Tanggal Cetak: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"));
            Paragraph metaParagraph = new Paragraph(periodText + printDateText, metaFont);
            metaParagraph.setAlignment(Element.ALIGN_CENTER);
            metaParagraph.setSpacingAfter(15f);
            document.add(metaParagraph);

            // Garis pembatas dekoratif
            PdfPTable lineTable = new PdfPTable(1);
            lineTable.setWidthPercentage(100);
            PdfPCell lineCell = new PdfPCell();
            lineCell.setBorder(PdfPCell.BOTTOM);
            lineCell.setBorderWidthBottom(1.5f);
            lineCell.setBorderColorBottom(primaryColor);
            lineCell.setFixedHeight(2f);
            lineTable.addCell(lineCell);
            lineTable.setSpacingAfter(20f);
            document.add(lineTable);

            // 2. SUMMARY STATISTICS SECTION
            Paragraph statsHeader = new Paragraph("RINGKASAN STATISTIK", sectionTitleFont);
            statsHeader.setSpacingAfter(10f);
            document.add(statsHeader);

            PdfPTable statsTable = new PdfPTable(2);
            statsTable.setWidthPercentage(100);
            statsTable.setWidths(new float[]{65f, 35f});
            statsTable.setSpacingAfter(20f);

            // Add Headers
            PdfPCell sh1 = new PdfPCell(new Phrase("Statistik", headerFont));
            sh1.setBackgroundColor(primaryColor);
            sh1.setPadding(8f);
            sh1.setBorderColor(borderGray);
            statsTable.addCell(sh1);

            PdfPCell sh2 = new PdfPCell(new Phrase("Nilai", headerFont));
            sh2.setBackgroundColor(primaryColor);
            sh2.setPadding(8f);
            sh2.setBorderColor(borderGray);
            sh2.setHorizontalAlignment(Element.ALIGN_CENTER);
            statsTable.addCell(sh2);

            // Format persentase secara bersih
            String responseRateStr = formatPercentage(stats.getResponseRate());

            // Populate rows
            addStatRow(statsTable, "Total Alumni", String.valueOf(stats.getTotalAlumni()), bodyFont, borderGray, lightBg);
            addStatRow(statsTable, "Total Responden", String.valueOf(stats.getTotalResponden()), bodyFont, borderGray, whiteColor);
            addStatRow(statsTable, "Belum Mengisi", String.valueOf(stats.getBelumMengisi()), bodyFont, borderGray, lightBg);
            addStatRow(statsTable, "Response Rate", responseRateStr, bodyFont, borderGray, whiteColor);

            document.add(statsTable);

            // 3. QUESTIONNAIRE ANALYTICS SECTION (Main Section)
            Paragraph qaHeader = new Paragraph("ANALISIS KUESIONER", sectionTitleFont);
            qaHeader.setSpacingBefore(10f);
            qaHeader.setSpacingAfter(15f);
            document.add(qaHeader);

            if (stats.getQuestionAnalytics() != null && !stats.getQuestionAnalytics().isEmpty()) {
                int qIndex = 1;
                for (var qa : stats.getQuestionAnalytics()) {
                    Paragraph qNumPara = new Paragraph("PERTANYAAN " + qIndex, subSectionTitleFont);
                    document.add(qNumPara);

                    Paragraph qTextPara = new Paragraph(qa.getQuestionText(), bodyBoldFont);
                    qTextPara.setSpacingAfter(8f);
                    document.add(qTextPara);

                    PdfPTable qaTable = new PdfPTable(3);
                    qaTable.setWidthPercentage(100);
                    qaTable.setWidths(new float[]{60f, 20f, 20f});
                    qaTable.setSpacingBefore(6f);
                    qaTable.setSpacingAfter(20f);
                    qaTable.setKeepTogether(true); // Mencegah tabel kuesioner terpotong halaman

                    // Headers
                    PdfPCell qh1 = new PdfPCell(new Phrase("Jawaban", headerFont));
                    qh1.setBackgroundColor(primaryColor);
                    qh1.setPadding(8f);
                    qh1.setBorderColor(borderGray);
                    qaTable.addCell(qh1);

                    PdfPCell qh2 = new PdfPCell(new Phrase("Jumlah", headerFont));
                    qh2.setBackgroundColor(primaryColor);
                    qh2.setPadding(8f);
                    qh2.setBorderColor(borderGray);
                    qh2.setHorizontalAlignment(Element.ALIGN_CENTER);
                    qaTable.addCell(qh2);

                    PdfPCell qh3 = new PdfPCell(new Phrase("Persentase", headerFont));
                    qh3.setBackgroundColor(primaryColor);
                    qh3.setPadding(8f);
                    qh3.setBorderColor(borderGray);
                    qh3.setHorizontalAlignment(Element.ALIGN_CENTER);
                    qaTable.addCell(qh3);

                    boolean altRow = false;
                    if (qa.getAnswers() != null) {
                        for (var ans : qa.getAnswers()) {
                            java.awt.Color rowBg = altRow ? lightBg : whiteColor;
                            altRow = !altRow;

                            PdfPCell c1 = new PdfPCell(new Phrase(ans.getAnswer(), bodyFont));
                            c1.setPadding(7f);
                            c1.setBorderColor(borderGray);
                            c1.setBackgroundColor(rowBg);
                            qaTable.addCell(c1);

                            PdfPCell c2 = new PdfPCell(new Phrase(String.valueOf(ans.getTotal()), bodyFont));
                            c2.setPadding(7f);
                            c2.setBorderColor(borderGray);
                            c2.setBackgroundColor(rowBg);
                            c2.setHorizontalAlignment(Element.ALIGN_CENTER);
                            qaTable.addCell(c2);

                            String pctStr = formatPercentage(ans.getPercentage());

                            PdfPCell c3 = new PdfPCell(new Phrase(pctStr, bodyFont));
                            c3.setPadding(7f);
                            c3.setBorderColor(borderGray);
                            c3.setBackgroundColor(rowBg);
                            c3.setHorizontalAlignment(Element.ALIGN_CENTER);
                            qaTable.addCell(c3);
                        }
                    }
                    document.add(qaTable);
                    qIndex++;
                }
            } else {
                Paragraph noData = new Paragraph("Belum ada data tanggapan kuesioner.", bodyFont);
                noData.setSpacingAfter(15f);
                document.add(noData);
            }

            // 4. AUTOMATIC CONCLUSION SECTION
            Paragraph conclusionHeader = new Paragraph("KESIMPULAN OTOMATIS", sectionTitleFont);
            conclusionHeader.setSpacingBefore(15f);
            conclusionHeader.setSpacingAfter(10f);
            document.add(conclusionHeader);

            com.lowagie.text.List bulletList = new com.lowagie.text.List(com.lowagie.text.List.UNORDERED, 10);
            bulletList.setListSymbol("\u2022 "); // bullet character

            if (stats.getQuestionAnalytics() != null && !stats.getQuestionAnalytics().isEmpty()) {
                // Menyusun kesimpulan otomatis berdasarkan tanggapan kuesioner
                for (var qa : stats.getQuestionAnalytics()) {
                    String sentence = generateInsightSentence(qa.getQuestionText(), qa.getMostSelectedAnswer(), qa.getMostSelectedPercentage());
                    bulletList.add(new com.lowagie.text.ListItem(sentence, bodyFont));
                }
            } else {
                bulletList.add(new com.lowagie.text.ListItem("Belum ada data kuesioner untuk ditarik kesimpulan.", bodyFont));
            }
            document.add(bulletList);

            // 5. APPENDIX SECTION (Lampiran Data Alumni)
            // Memaksa halaman baru untuk lampiran demi kerapian dokumen akademik
            document.newPage();

            Paragraph appendixHeader = new Paragraph("LAMPIRAN DATA ALUMNI", sectionTitleFont);
            appendixHeader.setSpacingAfter(10f);
            document.add(appendixHeader);

            PdfPTable alumniTable = new PdfPTable(3);
            alumniTable.setWidthPercentage(100);
            alumniTable.setWidths(new float[]{20f, 50f, 30f});
            alumniTable.setHeaderRows(1); // Mengulang judul tabel di setiap halaman baru
            alumniTable.setSpacingBefore(8f);

            // Table headers
            PdfPCell ah1 = new PdfPCell(new Phrase("NIM", headerFont));
            ah1.setBackgroundColor(primaryColor);
            ah1.setPadding(8f);
            ah1.setBorderColor(borderGray);
            alumniTable.addCell(ah1);

            PdfPCell ah2 = new PdfPCell(new Phrase("Nama", headerFont));
            ah2.setBackgroundColor(primaryColor);
            ah2.setPadding(8f);
            ah2.setBorderColor(borderGray);
            alumniTable.addCell(ah2);

            PdfPCell ah3 = new PdfPCell(new Phrase("Program Studi", headerFont));
            ah3.setBackgroundColor(primaryColor);
            ah3.setPadding(8f);
            ah3.setBorderColor(borderGray);
            alumniTable.addCell(ah3);

            boolean altRow = false;
            for (Alumni alumni : alumniList) {
                java.awt.Color rowBg = altRow ? lightBg : whiteColor;
                altRow = !altRow;

                PdfPCell c1 = new PdfPCell(new Phrase(alumni.getNim(), bodyFont));
                c1.setPadding(7f);
                c1.setBorderColor(borderGray);
                c1.setBackgroundColor(rowBg);
                c1.setHorizontalAlignment(Element.ALIGN_CENTER); // NIM center aligned
                alumniTable.addCell(c1);

                PdfPCell c2 = new PdfPCell(new Phrase(alumni.getNamaLengkap(), bodyFont));
                c2.setPadding(7f);
                c2.setBorderColor(borderGray);
                c2.setBackgroundColor(rowBg);
                alumniTable.addCell(c2);

                PdfPCell c3 = new PdfPCell(new Phrase(alumni.getProdi(), bodyFont));
                c3.setPadding(7f);
                c3.setBorderColor(borderGray);
                c3.setBackgroundColor(rowBg);
                alumniTable.addCell(c3);
            }

            document.add(alumniTable);
            document.close();

        } catch (DocumentException e) {
            throw new BusinessException("Gagal generate PDF: " + e.getMessage());
        }

        byte[] pdfBytes = out.toByteArray();

        // Simpan file ke direktori lokal
        String filePath = REPORT_DIR + "\\" + namaLaporan + ".pdf";
        try (FileOutputStream fos = new FileOutputStream(filePath)) {
            fos.write(pdfBytes);
        } catch (IOException e) {
            throw new BusinessException("Gagal menyimpan file PDF ke server: " + e.getMessage());
        }

        // Do not save export history to database

        return pdfBytes;
    }

    // Export to Excel
    // Menghasilkan dokumen Excel dengan 3 sheet terpisah dan pemformatan profesional.
    @Transactional
    public byte[] exportExcel(String adminUsername, Long periodeId, String namaLaporanInput) {
        ensureReportDirectoryExists();
        User admin = userRepository.findByUsername(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Admin tidak ditemukan"));

        String namaLaporan = (namaLaporanInput == null || namaLaporanInput.trim().isEmpty()) 
                ? "Laporan_Tracer_Study_" + System.currentTimeMillis() 
                : namaLaporanInput.trim().replace(" ", "_");

        List<Alumni> alumniList = alumniRepository.findAll();
        var stats = dashboardService.getDashboardStats(periodeId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // 1. STYLES DEFINITION
            // Title Style (14pt, Bold)
            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);

            // Table Header Style (Royal Blue background, white bold text, thin borders)
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(org.apache.poi.ss.usermodel.IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);

            // Data Style (Thin borders)
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dataStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dataStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dataStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);

            // Center Data Style
            CellStyle centerDataStyle = workbook.createCellStyle();
            centerDataStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            centerDataStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            centerDataStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            centerDataStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            centerDataStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);

            // Fetch nama periode
            String namePeriode = "Semua Periode";
            if (periodeId != null) {
                var pOpt = periodeKuesionerRepository.findById(periodeId);
                if (pOpt.isPresent()) {
                    namePeriode = pOpt.get().getNamaPeriode();
                }
            }

            // --- SHEET 1: Ringkasan Statistik ---
            Sheet statsSheet = workbook.createSheet("Ringkasan Statistik");
            
            Row r0 = statsSheet.createRow(0);
            Cell c0 = r0.createCell(0);
            c0.setCellValue("LAPORAN TRACER STUDY ALUMNI");
            c0.setCellStyle(titleStyle);

            Row r1 = statsSheet.createRow(1);
            Cell c1 = r1.createCell(0);
            c1.setCellValue("STMIK MARDIRA INDONESIA");
            c1.setCellStyle(titleStyle);

            Row r2 = statsSheet.createRow(2);
            r2.createCell(0).setCellValue("Tanggal Cetak: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")));

            Row r3 = statsSheet.createRow(3);
            r3.createCell(0).setCellValue("Periode: " + namePeriode);

            // Headers for stats table
            Row statsHeaderRow = statsSheet.createRow(5);
            Cell shCell1 = statsHeaderRow.createCell(0);
            shCell1.setCellValue("Statistik");
            shCell1.setCellStyle(headerStyle);

            Cell shCell2 = statsHeaderRow.createCell(1);
            shCell2.setCellValue("Nilai");
            shCell2.setCellStyle(headerStyle);

            String responseRateStr = formatPercentage(stats.getResponseRate());

            String[][] metrics = {
                {"Total Alumni", String.valueOf(stats.getTotalAlumni())},
                {"Total Responden", String.valueOf(stats.getTotalResponden())},
                {"Belum Mengisi", String.valueOf(stats.getBelumMengisi())},
                {"Response Rate", responseRateStr}
            };

            int statsRowIdx = 6;
            for (String[] metric : metrics) {
                Row row = statsSheet.createRow(statsRowIdx++);
                Cell cellA = row.createCell(0);
                cellA.setCellValue(metric[0]);
                cellA.setCellStyle(dataStyle);

                Cell cellB = row.createCell(1);
                // Coba set numeric value jika berupa angka murni untuk memudahkan sorting/formula di Excel
                try {
                    cellB.setCellValue(Double.parseDouble(metric[1]));
                } catch (NumberFormatException e) {
                    cellB.setCellValue(metric[1]);
                }
                cellB.setCellStyle(centerDataStyle);
            }

            // Freeze header rows on stats page (freeze row index 6, which freezes row index 0 to 5)
            statsSheet.createFreezePane(0, 6);

            statsSheet.autoSizeColumn(0);
            statsSheet.autoSizeColumn(1);

            // --- SHEET 2: Analisis Kuesioner ---
            Sheet analyticsSheet = workbook.createSheet("Analisis Kuesioner");

            Row aTitleRow = analyticsSheet.createRow(0);
            Cell aTitleCell = aTitleRow.createCell(0);
            aTitleCell.setCellValue("ANALISIS DETAIL JAWABAN KUESIONER");
            aTitleCell.setCellStyle(titleStyle);

            Row aMetaRow = analyticsSheet.createRow(1);
            aMetaRow.createCell(0).setCellValue("Sumber: Respon Tracer Study Alumni (Periode: " + namePeriode + ")");

            int aRowIdx = 3;
            if (stats.getQuestionAnalytics() != null) {
                int qNum = 1;
                for (var qa : stats.getQuestionAnalytics()) {
                    // Question text header
                    Row qRow = analyticsSheet.createRow(aRowIdx++);
                    Cell qCell = qRow.createCell(0);
                    qCell.setCellValue("PERTANYAAN " + qNum + ": " + qa.getQuestionText());
                    qCell.setCellStyle(titleStyle);

                    // Headers for question table
                    Row qHeaderRow = analyticsSheet.createRow(aRowIdx++);
                    String[] qHeaders = {"Jawaban", "Jumlah", "Persentase"};
                    for (int i = 0; i < qHeaders.length; i++) {
                        Cell cell = qHeaderRow.createCell(i);
                        cell.setCellValue(qHeaders[i]);
                        cell.setCellStyle(headerStyle);
                    }

                    // Populate responses data
                    if (qa.getAnswers() != null) {
                        for (var ans : qa.getAnswers()) {
                            Row row = analyticsSheet.createRow(aRowIdx++);
                            Cell cellAns = row.createCell(0);
                            cellAns.setCellValue(ans.getAnswer());
                            cellAns.setCellStyle(dataStyle);

                            Cell cellCount = row.createCell(1);
                            cellCount.setCellValue(ans.getTotal());
                            cellCount.setCellStyle(centerDataStyle);

                            String pctStr = formatPercentage(ans.getPercentage());

                            Cell cellPct = row.createCell(2);
                            cellPct.setCellValue(pctStr);
                            cellPct.setCellStyle(centerDataStyle);
                        }
                    }
                    
                    // Spacer rows
                    aRowIdx += 2;
                    qNum++;
                }
            }

            // Freeze top titles on analytics sheet
            analyticsSheet.createFreezePane(0, 2);
            analyticsSheet.autoSizeColumn(0);
            analyticsSheet.autoSizeColumn(1);
            analyticsSheet.autoSizeColumn(2);

            // --- SHEET 3: Data Alumni ---
            Sheet alumniSheet = workbook.createSheet("Data Alumni");

            Row alTitleRow = alumniSheet.createRow(0);
            Cell alTitleCell = alTitleRow.createCell(0);
            alTitleCell.setCellValue("LAMPIRAN DAFTAR ALUMNI");
            alTitleCell.setCellStyle(titleStyle);

            // Table headers (Row 2)
            Row alHeaderRow = alumniSheet.createRow(2);
            String[] alHeaders = {"NIM", "Nama", "Program Studi"};
            for (int i = 0; i < alHeaders.length; i++) {
                Cell cell = alHeaderRow.createCell(i);
                cell.setCellValue(alHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            // Freeze headers on alumni list sheet (freeze rows 0, 1, 2)
            alumniSheet.createFreezePane(0, 3);

            // Populate rows (Row 3+)
            int alRowIdx = 3;
            for (Alumni alumni : alumniList) {
                Row row = alumniSheet.createRow(alRowIdx++);
                
                Cell cellNim = row.createCell(0);
                cellNim.setCellValue(alumni.getNim());
                cellNim.setCellStyle(centerDataStyle); // Center aligned NIM

                Cell cellNama = row.createCell(1);
                cellNama.setCellValue(alumni.getNamaLengkap());
                cellNama.setCellStyle(dataStyle);

                Cell cellProdi = row.createCell(2);
                cellProdi.setCellValue(alumni.getProdi());
                cellProdi.setCellStyle(dataStyle);
            }

            alumniSheet.autoSizeColumn(0);
            alumniSheet.autoSizeColumn(1);
            alumniSheet.autoSizeColumn(2);

            workbook.write(out);
            byte[] excelBytes = out.toByteArray();

            // Simpan file ke direktori lokal
            String filePath = REPORT_DIR + "\\" + namaLaporan + ".xlsx";
            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                fos.write(excelBytes);
            }

            // Do not save export history to database

            return excelBytes;

        } catch (IOException e) {
            throw new BusinessException("Gagal generate Excel: " + e.getMessage());
        }
    }

    // Helper to generate a single stat table row in PDF
    // Membuat baris data ringkasan statistik dengan pewarnaan custom
    private void addStatRow(PdfPTable table, String indicator, String value, Font font, java.awt.Color borderColor, java.awt.Color bg) {
        PdfPCell cell1 = new PdfPCell(new Phrase(indicator, font));
        cell1.setPadding(8f);
        cell1.setBorderColor(borderColor);
        cell1.setBackgroundColor(bg);
        table.addCell(cell1);

        PdfPCell cell2 = new PdfPCell(new Phrase(value, font));
        cell2.setPadding(8f);
        cell2.setBorderColor(borderColor);
        cell2.setBackgroundColor(bg);
        cell2.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell2);
    }

    // Dynamic conclusion insight sentence builder
    // Menyusun kesimpulan otomatis berdasarkan tanggapan terbanyak
    private String generateInsightSentence(String questionText, String mostSelectedAnswer, double percentage) {
        String qLower = questionText.toLowerCase();
        String ans = mostSelectedAnswer;
        String ansLower = mostSelectedAnswer.toLowerCase();
        String pct = formatPercentage(percentage);

        if (qLower.contains("aktivitas")) {
            return "Mayoritas alumni saat ini " + ansLower + " (" + pct + ").";
        } else if (qLower.contains("lama mendapatkan") || qLower.contains("masa tunggu") || qLower.contains("waktu mendapatkan") || qLower.contains("pekerjaan pertama")) {
            return "Mayoritas alumni memperoleh pekerjaan pertama dalam waktu " + ansLower + " (" + pct + ").";
        } else if (qLower.contains("dosen")) {
            return "Alumni menilai kualitas dosen " + ansLower + " (" + pct + ").";
        } else if (qLower.contains("kurikulum")) {
            return "Alumni menilai relevansi kurikulum perkuliahan " + ansLower + " (" + pct + ").";
        } else if (qLower.contains("puas") || qLower.contains("pendidikan")) {
            if (ansLower.contains("puas")) {
                return "Alumni " + ansLower + " terhadap kualitas pendidikan kampus (" + pct + ").";
            } else {
                return "Alumni menilai kepuasan kualitas pendidikan kampus adalah " + ans + " (" + pct + ").";
            }
        } else if (qLower.contains("rekomendasi")) {
            if (ansLower.contains("ya") || ansLower.contains("bersedia") || ansLower.contains("merekomendasikan") || ansLower.contains("sangat bersedia")) {
                return "Alumni bersedia merekomendasikan kampus kepada orang lain (" + pct + ").";
            } else {
                return "Alumni menyatakan " + ansLower + " untuk merekomendasikan kampus kepada orang lain (" + pct + ").";
            }
        } else if (qLower.contains("kesesuaian") || qLower.contains("bidang studi") || qLower.contains("sesuai")) {
            return "Alumni menilai kesesuaian bidang studi dengan pekerjaan adalah " + ansLower + " (" + pct + ").";
        } else {
            return "Untuk indikator \"" + questionText + "\", jawaban terbanyak adalah \"" + ans + "\" (" + pct + ").";
        }
    }
}
