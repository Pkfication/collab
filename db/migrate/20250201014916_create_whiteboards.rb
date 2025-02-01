class CreateWhiteboards < ActiveRecord::Migration[8.0]
  def change
    create_table :whiteboards do |t|
      t.string :name

      t.timestamps
    end
  end
end
