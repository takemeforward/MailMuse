package com.email.extension.emailapp;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class EmailGeneratorService {
	
	private final WebClient webClient;
	public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }
	
	@Value("${gemeni.api.url}")
	private String gemeniApiUrl;
	
	@Value("${gemeni.api.key}")
	private String gemeniApiKey;
	
	public String generateEmailReply(EmailRequest emailRequest) {
		// build prompt
		String prompt = buildPrompt(emailRequest);
		
		// craft a request
		Map<String, Object> requestBody = Map.of(
				"contents", new Object[] {
					Map.of(
							"parts", new Object[] {
									Map.of("text", prompt)
							}
							)
				}
				);
		// do request get response
		
		String response = webClient.post()
							.uri(gemeniApiUrl+gemeniApiKey)
								.header("contentType", "application/json")
									.bodyValue(requestBody)
										.retrieve()
											.bodyToMono(String.class)
												.block();
		
		//extract and return the response
		
		return extractResponseContent(response);
	}
	
	private String extractResponseContent(String response) {
		try {
			ObjectMapper mapper = new ObjectMapper();
			JsonNode rootNode = mapper.readTree(response);
			
			return rootNode.path("candidates")
					.get(0)
					.path("content")
					.path("parts")
					.get(0)
					.path("text")
					.asText();
			
		}catch(Exception e) {
			return "Error processing request!!\n"+e.getMessage();
		}
	}

	public String buildPrompt(EmailRequest emailRequest) {
		StringBuilder prompt = new StringBuilder();
		prompt.append("Generate a professional email reply for the above email content. Please don't generate a subject line. ");
		if(emailRequest.getTone()!=null || emailRequest.getTone()!="") {
			prompt.append("Please Use a ").append(emailRequest.getTone()).append("tone. ");
		}
		prompt.append("\n Original email is:\n" ).append(emailRequest.getEmailContent());
		return prompt.toString();
	}
}
