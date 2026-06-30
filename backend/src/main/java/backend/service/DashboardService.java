package backend.service;

import backend.dto.DashboardDto;
import backend.dto.QuestionAnalyticsDto;
import backend.dto.AnswerAnalyticsDto;
import backend.entity.Kuesioner;
import backend.entity.Pertanyaan;
import backend.entity.Jawaban;
import backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Service Layer
// Tempat seluruh business logic aplikasi.
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AlumniRepository alumniRepository;
    private final PengisianKuesionerRepository pengisianKuesionerRepository;
    private final KuesionerRepository kuesionerRepository;
    private final PertanyaanRepository pertanyaanRepository;
    private final JawabanRepository jawabanRepository;

    public DashboardDto getDashboardStats() {
        return getDashboardStats(null);
    }

    public DashboardDto getDashboardStats(Long periodeId) {
        DashboardDto dto = new DashboardDto();

        long totalAlumni = alumniRepository.count();
        long totalResponden;
        long totalKuesionerAktif;
        long totalPertanyaanAktif;

        List<Kuesioner> targetKuesioners;

        if (periodeId == null) {
            totalResponden = pengisianKuesionerRepository.countDistinctAlumni();
            // Get currently active questionnaires
            targetKuesioners = kuesionerRepository.findActiveQuestionnaires(LocalDate.now());
            totalKuesionerAktif = targetKuesioners.size();
            totalPertanyaanAktif = targetKuesioners.stream()
                .mapToLong(k -> pertanyaanRepository.findByKuesionerId(k.getId()).size())
                .sum();
        } else {
            totalResponden = pengisianKuesionerRepository.countDistinctAlumniByPeriodeId(periodeId);
            // Get all questionnaires in the specified period
            targetKuesioners = kuesionerRepository.findByPeriodeId(periodeId);
            totalKuesionerAktif = targetKuesioners.size();
            totalPertanyaanAktif = targetKuesioners.stream()
                .mapToLong(k -> pertanyaanRepository.findByKuesionerId(k.getId()).size())
                .sum();
        }

        long belumMengisi = totalAlumni - totalResponden;
        double responseRate = totalAlumni > 0 ? ((double) totalResponden / totalAlumni) * 100.0 : 0.0;

        dto.setTotalAlumni(totalAlumni);
        dto.setTotalResponden(totalResponden);
        dto.setBelumMengisi(belumMengisi);
        dto.setResponseRate(Math.round(responseRate * 100.0) / 100.0);
        dto.setTotalKuesionerAktif(totalKuesionerAktif);
        dto.setTotalPertanyaanAktif(totalPertanyaanAktif);

        List<QuestionAnalyticsDto> questionAnalyticsList = new ArrayList<>();
        ObjectMapper mapper = new ObjectMapper();

        for (Kuesioner k : targetKuesioners) {
            List<Pertanyaan> questions = pertanyaanRepository.findByKuesionerIdOrderByOrderIndexAsc(k.getId());
            for (Pertanyaan p : questions) {
                QuestionAnalyticsDto qDto = new QuestionAnalyticsDto();
                qDto.setQuestionId(p.getId());
                qDto.setQuestionText(p.getTeksPertanyaan());

                List<Jawaban> jawabanList = jawabanRepository.findByPertanyaanId(p.getId());
                long totalAnswers = jawabanList.size();

                List<AnswerAnalyticsDto> answerList = new ArrayList<>();
                String mostSelectedAnswer = null;
                long mostSelectedCount = 0;
                double mostSelectedPercentage = 0.0;

                if (p.getTipePertanyaan() == Pertanyaan.TipePertanyaan.CHOICE && p.getPilihan() != null) {
                    try {
                        String[] options = mapper.readValue(p.getPilihan(), String[].class);
                        for (String option : options) {
                            long count = jawabanList.stream()
                                .filter(j -> option.equalsIgnoreCase(j.getJawabanTeks()))
                                .count();
                            double percentage = totalAnswers > 0 ? ((double) count / totalAnswers) * 100.0 : 0.0;
                            percentage = Math.round(percentage * 100.0) / 100.0;

                            AnswerAnalyticsDto aDto = new AnswerAnalyticsDto();
                            aDto.setAnswer(option);
                            aDto.setTotal(count);
                            aDto.setPercentage(percentage);
                            answerList.add(aDto);

                            if (count > mostSelectedCount) {
                                mostSelectedCount = count;
                                mostSelectedAnswer = option;
                                mostSelectedPercentage = percentage;
                            }
                        }
                    } catch (Exception e) {
                        // ignore or fallback
                    }
                } else if (p.getTipePertanyaan() == Pertanyaan.TipePertanyaan.TEXT) {
                    Map<String, Long> textCounts = jawabanList.stream()
                        .map(Jawaban::getJawabanTeks)
                        .filter(t -> t != null && !t.trim().isEmpty())
                        .collect(Collectors.groupingBy(t -> t, Collectors.counting()));

                    for (Map.Entry<String, Long> entry : textCounts.entrySet()) {
                        String text = entry.getKey();
                        long count = entry.getValue();
                        double percentage = totalAnswers > 0 ? ((double) count / totalAnswers) * 100.0 : 0.0;
                        percentage = Math.round(percentage * 100.0) / 100.0;

                        AnswerAnalyticsDto aDto = new AnswerAnalyticsDto();
                        aDto.setAnswer(text);
                        aDto.setTotal(count);
                        aDto.setPercentage(percentage);
                        answerList.add(aDto);

                        if (count > mostSelectedCount) {
                            mostSelectedCount = count;
                            mostSelectedAnswer = text;
                            mostSelectedPercentage = percentage;
                        }
                    }
                    // Sort text answers descending by total count
                    answerList.sort((a, b) -> Long.compare(b.getTotal(), a.getTotal()));
                }

                qDto.setAnswers(answerList);
                qDto.setMostSelectedAnswer(mostSelectedAnswer != null ? mostSelectedAnswer : "-");
                qDto.setMostSelectedCount(mostSelectedCount);
                qDto.setMostSelectedPercentage(mostSelectedPercentage);
                questionAnalyticsList.add(qDto);
            }
        }

        dto.setQuestionAnalytics(questionAnalyticsList);
        return dto;
    }
}
