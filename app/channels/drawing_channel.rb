class DrawingChannel < ApplicationCable::Channel
  def subscribed
    whiteboard_id = params[:whiteboard_id]

    Rails.logger.info "Subscription params: #{params.inspect}"
    Rails.logger.info "Attempting to subscribe to whiteboard: #{whiteboard_id}"

    if whiteboard_id.present?
      begin
        @whiteboard = Whiteboard.find(whiteboard_id)
        stream_from "whiteboard_#{whiteboard_id}"
        Rails.logger.info "Successfully subscribed to whiteboard: #{whiteboard_id}"
      rescue ActiveRecord::RecordNotFound
        Rails.logger.error "Whiteboard not found with ID: #{whiteboard_id}"
        reject
      end
    else
      # Fallback: use the first whiteboard or create a new one
      @whiteboard = Whiteboard.first_or_create(name: "Default Whiteboard")
      stream_from "whiteboard_#{@whiteboard.id}"
      Rails.logger.info "Subscribed to default whiteboard: #{@whiteboard.id}"
    end
  end

  def receive(data)
    whiteboard_id = data["whiteboard_id"]
    drawing_data = data["drawing_data"]

    Rails.logger.info "Received drawing data for whiteboard: #{whiteboard_id}"
    Rails.logger.info "Drawing data: #{drawing_data}"

    if whiteboard_id && drawing_data
      # Broadcast to all subscribers of this specific whiteboard
      ActionCable.server.broadcast("whiteboard_#{whiteboard_id}", {
        drawing_data: drawing_data
      })
    end
  end
end
