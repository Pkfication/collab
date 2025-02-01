class AddDescriptionToWhiteboards < ActiveRecord::Migration[8.0]
  def change
    add_column :whiteboards, :description, :text
  end
end
