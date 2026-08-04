package com.adminpersonal.shared.notification;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventPublisher {

	private final ApplicationEventPublisher eventPublisher;

	public NotificationEventPublisher(ApplicationEventPublisher eventPublisher) {
		this.eventPublisher = eventPublisher;
	}

	public void publish(Object event) {
		eventPublisher.publishEvent(event);
	}
}
