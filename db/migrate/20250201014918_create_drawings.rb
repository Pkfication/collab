class CreateDrawings < ActiveRecord::Migration[8.0]
  def change
    create_table :drawings do |t|
      t.references :whiteboard, null: false, foreign_key: true
      t.json :data

      t.timestamps
    end
  end
end
