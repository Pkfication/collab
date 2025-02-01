class WhiteboardsController < ApplicationController
  def index
    @whiteboards = Whiteboard.all
  end

  def show
    @whiteboard = Whiteboard.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    # Handle case where whiteboard is not found
    flash[:alert] = "Whiteboard not found"
    redirect_to root_path
  end

  def new
    @whiteboard = Whiteboard.new
  end

  def create
    @whiteboard = Whiteboard.new(whiteboard_params)
    if @whiteboard.save
      redirect_to @whiteboard, notice: "Whiteboard created successfully."
    else
      render :new
    end
  end

  private

  def whiteboard_params
    params.require(:whiteboard).permit(:name, :description)
  end
end
