class Whiteboard < ApplicationRecord
  has_many :drawings, dependent: :destroy
  validates :name, presence: true, length: { minimum: 3, maximum: 50 }
  validates :description, length: { maximum: 200 }, allow_blank: true
end
